import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../server/utils/prisma'
import { createTestUser, createTestTournament, createTestTeam } from './helpers'
import { createTeamSchema, updateTeamSchema } from '../server/utils/validators'

describe('Teams', () => {
  let adminUser: Awaited<ReturnType<typeof createTestUser>>
  let tournament: Awaited<ReturnType<typeof createTestTournament>>

  beforeEach(async () => {
    adminUser = await createTestUser('ADMIN')
    tournament = await createTestTournament(adminUser.user.id)
  })

  describe('Team Validation', () => {
    it('should validate correct team data', () => {
      const data = {
        name: 'Les Warriors',
        player1Name: 'Alice',
        player2Name: 'Bob'
      }

      const result = createTeamSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject empty team name', () => {
      const data = {
        name: '',
        player1Name: 'Alice',
        player2Name: 'Bob'
      }

      const result = createTeamSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject empty player names', () => {
      const data1 = {
        name: 'Team',
        player1Name: '',
        player2Name: 'Bob'
      }

      const data2 = {
        name: 'Team',
        player1Name: 'Alice',
        player2Name: ''
      }

      expect(createTeamSchema.safeParse(data1).success).toBe(false)
      expect(createTeamSchema.safeParse(data2).success).toBe(false)
    })

    it('should validate partial update data', () => {
      const data = {
        name: 'Updated Team Name'
      }

      const result = updateTeamSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Team CRUD Operations', () => {
    it('should create a team', async () => {
      const team = await prisma.team.create({
        data: {
          name: 'Les Warriors',
          player1Name: 'Alice',
          player2Name: 'Bob',
          tournamentId: tournament.id
        }
      })

      expect(team.id).toBeDefined()
      expect(team.name).toBe('Les Warriors')
      expect(team.player1Name).toBe('Alice')
      expect(team.player2Name).toBe('Bob')
      expect(team.tournamentId).toBe(tournament.id)
    })

    it('should list teams for a tournament', async () => {
      await createTestTeam(tournament.id)
      await createTestTeam(tournament.id)

      const teams = await prisma.team.findMany({
        where: { tournamentId: tournament.id }
      })

      expect(teams).toHaveLength(2)
    })

    it('should find team by id', async () => {
      const created = await createTestTeam(tournament.id)

      const team = await prisma.team.findUnique({
        where: { id: created.id }
      })

      expect(team).toBeDefined()
      expect(team?.id).toBe(created.id)
    })

    it('should update team', async () => {
      const team = await createTestTeam(tournament.id)

      const updated = await prisma.team.update({
        where: { id: team.id },
        data: {
          name: 'Updated Team',
          player1Name: 'Charlie',
          player2Name: 'David'
        }
      })

      expect(updated.name).toBe('Updated Team')
      expect(updated.player1Name).toBe('Charlie')
      expect(updated.player2Name).toBe('David')
    })

    it('should update team partially', async () => {
      const team = await createTestTeam(tournament.id)

      const updated = await prisma.team.update({
        where: { id: team.id },
        data: {
          name: 'New Name Only'
        }
      })

      expect(updated.name).toBe('New Name Only')
      expect(updated.player1Name).toBe(team.player1Name)
      expect(updated.player2Name).toBe(team.player2Name)
    })

    it('should delete team', async () => {
      const team = await createTestTeam(tournament.id)

      await prisma.team.delete({
        where: { id: team.id }
      })

      const found = await prisma.team.findUnique({
        where: { id: team.id }
      })

      expect(found).toBeNull()
    })
  })

  describe('Team Relations', () => {
    it('should include tournament in query', async () => {
      const team = await createTestTeam(tournament.id)

      const result = await prisma.team.findUnique({
        where: { id: team.id },
        include: {
          tournament: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      expect(result?.tournament.id).toBe(tournament.id)
      expect(result?.tournament.name).toBe(tournament.name)
    })

    it('should cascade delete when tournament is deleted', async () => {
      const team = await createTestTeam(tournament.id)

      await prisma.tournament.delete({
        where: { id: tournament.id }
      })

      const found = await prisma.team.findUnique({
        where: { id: team.id }
      })

      expect(found).toBeNull()
    })

    it('should order teams by creation date', async () => {
      const team1 = await prisma.team.create({
        data: {
          name: 'Team 1',
          player1Name: 'A',
          player2Name: 'B',
          tournamentId: tournament.id
        }
      })

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10))

      const team2 = await prisma.team.create({
        data: {
          name: 'Team 2',
          player1Name: 'C',
          player2Name: 'D',
          tournamentId: tournament.id
        }
      })

      const teams = await prisma.team.findMany({
        where: { tournamentId: tournament.id },
        orderBy: { createdAt: 'asc' }
      })

      expect(teams[0].id).toBe(team1.id)
      expect(teams[1].id).toBe(team2.id)
    })
  })

  describe('Multiple Tournaments', () => {
    it('should isolate teams between tournaments', async () => {
      const tournament2 = await createTestTournament(adminUser.user.id)

      await createTestTeam(tournament.id)
      await createTestTeam(tournament2.id)

      const teams1 = await prisma.team.findMany({
        where: { tournamentId: tournament.id }
      })

      const teams2 = await prisma.team.findMany({
        where: { tournamentId: tournament2.id }
      })

      expect(teams1).toHaveLength(1)
      expect(teams2).toHaveLength(1)
      expect(teams1[0].tournamentId).toBe(tournament.id)
      expect(teams2[0].tournamentId).toBe(tournament2.id)
    })
  })

  describe('Team Player Names', () => {
    it('should store player names as strings', async () => {
      const team = await prisma.team.create({
        data: {
          name: 'Test Team',
          player1Name: 'Alice Smith',
          player2Name: 'Bob Jones',
          tournamentId: tournament.id
        }
      })

      expect(typeof team.player1Name).toBe('string')
      expect(typeof team.player2Name).toBe('string')
      expect(team.player1Name).toBe('Alice Smith')
      expect(team.player2Name).toBe('Bob Jones')
    })

    it('should allow special characters in player names', async () => {
      const team = await prisma.team.create({
        data: {
          name: 'Test Team',
          player1Name: "O'Connor",
          player2Name: 'José García',
          tournamentId: tournament.id
        }
      })

      expect(team.player1Name).toBe("O'Connor")
      expect(team.player2Name).toBe('José García')
    })
  })
})
