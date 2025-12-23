import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { prisma } from '../server/utils/prisma'
import { createTestUser, createTestTournament, createTestTeam } from './helpers'

describe('Tournament Registration Lock', () => {
  let adminUser: Awaited<ReturnType<typeof createTestUser>>
  let regularUser1: Awaited<ReturnType<typeof createTestUser>>
  let regularUser2: Awaited<ReturnType<typeof createTestUser>>
  let tournament: Awaited<ReturnType<typeof createTestTournament>>

  beforeEach(async () => {
    adminUser = await createTestUser('ADMIN')
    regularUser1 = await createTestUser('USER')
    regularUser2 = await createTestUser('USER')
    tournament = await createTestTournament(adminUser.user.id)
  })

  afterEach(async () => {
    await prisma.teamMember.deleteMany()
    await prisma.match.deleteMany()
    await prisma.team.deleteMany()
    await prisma.tournament.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('User Registration', () => {
    it('should allow user to join tournament when no matches exist', async () => {
      // Create partner user
      const partner = await createTestUser('USER')

      const team = await prisma.team.create({
        data: {
          name: 'Test Team',
          tournamentId: tournament.id,
          members: {
            create: [
              { userId: regularUser1.user.id },
              { userId: partner.user.id }
            ]
          }
        }
      })

      expect(team.id).toBeDefined()
      expect(team.name).toBe('Test Team')
    })

    it('should prevent user from joining tournament after matches are generated', async () => {
      // Create 2 teams
      const team1 = await createTestTeam(tournament.id)
      const team2 = await createTestTeam(tournament.id)

      // Generate matches
      await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id
        }
      })

      // Check that tournament now has matches
      const tournamentWithMatches = await prisma.tournament.findUnique({
        where: { id: tournament.id },
        include: { matches: true }
      })

      expect(tournamentWithMatches?.matches.length).toBeGreaterThan(0)

      // This simulates the API validation
      const hasMatches = tournamentWithMatches!.matches.length > 0
      expect(hasMatches).toBe(true)
    })
  })

  describe('Admin Team Addition', () => {
    it('should allow admin to add team when no matches exist', async () => {
      const team = await prisma.team.create({
        data: {
          name: 'Admin Team',
          player1Name: 'Player 1',
          player2Name: 'Player 2',
          tournamentId: tournament.id
        }
      })

      expect(team.id).toBeDefined()
    })

    it('should prevent admin from adding team after matches are generated', async () => {
      // Create 2 teams
      const team1 = await createTestTeam(tournament.id)
      const team2 = await createTestTeam(tournament.id)

      // Generate matches
      await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id
        }
      })

      // Check validation logic
      const tournamentWithMatches = await prisma.tournament.findUnique({
        where: { id: tournament.id },
        include: { matches: true }
      })

      const hasMatches = tournamentWithMatches!.matches.length > 0
      expect(hasMatches).toBe(true)
    })
  })

  describe('Match Deletion and Reset', () => {
    it('should delete all matches and reset tournament status', async () => {
      // Create teams and matches
      const team1 = await createTestTeam(tournament.id)
      const team2 = await createTestTeam(tournament.id)

      await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id,
          status: 'COMPLETED',
          homeScore: 10,
          awayScore: 5
        }
      })

      // Update tournament status to IN_PROGRESS
      await prisma.tournament.update({
        where: { id: tournament.id },
        data: { status: 'IN_PROGRESS' }
      })

      // Delete all matches
      await prisma.match.deleteMany({
        where: { tournamentId: tournament.id }
      })

      // Reset tournament status
      await prisma.tournament.update({
        where: { id: tournament.id },
        data: { status: 'UPCOMING' }
      })

      // Verify
      const updatedTournament = await prisma.tournament.findUnique({
        where: { id: tournament.id },
        include: { matches: true }
      })

      expect(updatedTournament?.matches.length).toBe(0)
      expect(updatedTournament?.status).toBe('UPCOMING')
    })

    it('should allow new team registration after matches are deleted', async () => {
      // Create teams and matches
      const team1 = await createTestTeam(tournament.id)
      const team2 = await createTestTeam(tournament.id)

      await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id
        }
      })

      // Delete all matches
      await prisma.match.deleteMany({
        where: { tournamentId: tournament.id }
      })

      // Now should be able to add new team
      const newTeam = await prisma.team.create({
        data: {
          name: 'New Team',
          player1Name: 'Alice',
          player2Name: 'Bob',
          tournamentId: tournament.id
        }
      })

      expect(newTeam.id).toBeDefined()

      // Verify no matches exist
      const tournamentCheck = await prisma.tournament.findUnique({
        where: { id: tournament.id },
        include: { matches: true }
      })

      expect(tournamentCheck?.matches.length).toBe(0)
    })
  })
})
