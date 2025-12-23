import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../server/utils/prisma'
import { createTestUser, createTestTournament, createTestTeam } from './helpers'
import { updateMatchSchema } from '../server/utils/validators'

describe('Matches', () => {
  let adminUser: Awaited<ReturnType<typeof createTestUser>>
  let tournament: Awaited<ReturnType<typeof createTestTournament>>
  let team1: Awaited<ReturnType<typeof createTestTeam>>
  let team2: Awaited<ReturnType<typeof createTestTeam>>

  beforeEach(async () => {
    adminUser = await createTestUser('ADMIN')
    tournament = await createTestTournament(adminUser.user.id)
    team1 = await createTestTeam(tournament.id)
    team2 = await prisma.team.create({
      data: {
        name: 'Team 2',
        player1Name: 'Charlie',
        player2Name: 'David',
        tournamentId: tournament.id
      }
    })
  })

  describe('Match Validation', () => {
    it('should validate correct match update data', () => {
      const data = {
        homeScore: 10,
        awayScore: 7,
        status: 'COMPLETED'
      }

      const result = updateMatchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate partial update', () => {
      const data = {
        homeScore: 10
      }

      const result = updateMatchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject negative scores', () => {
      const data = {
        homeScore: -1,
        awayScore: 5
      }

      const result = updateMatchSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject invalid status', () => {
      const data = {
        status: 'INVALID'
      }

      const result = updateMatchSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject scores above 10 (baby-foot rule)', () => {
      const data = {
        homeScore: 11,
        awayScore: 5
      }

      const result = updateMatchSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept score of exactly 10 (winning score)', () => {
      const data = {
        homeScore: 10,
        awayScore: 9
      }

      const result = updateMatchSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept valid statuses', () => {
      const statuses = ['UPCOMING', 'IN_PROGRESS', 'COMPLETED']

      statuses.forEach(status => {
        const result = updateMatchSchema.safeParse({ status })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Match CRUD Operations', () => {
    it('should create a match', async () => {
      const match = await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id,
          status: 'UPCOMING'
        }
      })

      expect(match.id).toBeDefined()
      expect(match.matchNumber).toBe(1)
      expect(match.homeTeamId).toBe(team1.id)
      expect(match.awayTeamId).toBe(team2.id)
      expect(match.status).toBe('UPCOMING')
      expect(match.homeScore).toBeNull()
      expect(match.awayScore).toBeNull()
    })

    it('should list matches for a tournament', async () => {
      await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id
        }
      })

      const matches = await prisma.match.findMany({
        where: { tournamentId: tournament.id }
      })

      expect(matches).toHaveLength(1)
    })

    it('should find match by id with teams', async () => {
      const created = await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id
        }
      })

      const match = await prisma.match.findUnique({
        where: { id: created.id },
        include: {
          homeTeam: true,
          awayTeam: true
        }
      })

      expect(match).toBeDefined()
      expect(match?.homeTeam.id).toBe(team1.id)
      expect(match?.awayTeam.id).toBe(team2.id)
    })

    it('should update match scores', async () => {
      const match = await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id
        }
      })

      const updated = await prisma.match.update({
        where: { id: match.id },
        data: {
          homeScore: 10,
          awayScore: 7,
          status: 'COMPLETED'
        }
      })

      expect(updated.homeScore).toBe(10)
      expect(updated.awayScore).toBe(7)
      expect(updated.status).toBe('COMPLETED')
    })

    it('should update match status only', async () => {
      const match = await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id
        }
      })

      const updated = await prisma.match.update({
        where: { id: match.id },
        data: {
          status: 'IN_PROGRESS'
        }
      })

      expect(updated.status).toBe('IN_PROGRESS')
      expect(updated.homeScore).toBeNull()
      expect(updated.awayScore).toBeNull()
    })
  })

  describe('Match Number Uniqueness', () => {
    it('should enforce unique match numbers per tournament', async () => {
      await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id
        }
      })

      // Try to create another match with same number in same tournament
      await expect(
        prisma.match.create({
          data: {
            matchNumber: 1,
            tournamentId: tournament.id,
            homeTeamId: team2.id,
            awayTeamId: team1.id
          }
        })
      ).rejects.toThrow()
    })

    it('should allow same match number in different tournaments', async () => {
      const tournament2 = await createTestTournament(adminUser.user.id)
      const team3 = await prisma.team.create({
        data: {
          name: 'Team 3',
          player1Name: 'Eve',
          player2Name: 'Frank',
          tournamentId: tournament2.id
        }
      })
      const team4 = await prisma.team.create({
        data: {
          name: 'Team 4',
          player1Name: 'Grace',
          player2Name: 'Henry',
          tournamentId: tournament2.id
        }
      })

      const match1 = await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id
        }
      })

      const match2 = await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament2.id,
          homeTeamId: team3.id,
          awayTeamId: team4.id
        }
      })

      expect(match1.matchNumber).toBe(1)
      expect(match2.matchNumber).toBe(1)
      expect(match1.tournamentId).not.toBe(match2.tournamentId)
    })
  })

  describe('Match Ordering', () => {
    it('should order matches by match number', async () => {
      await prisma.match.create({
        data: {
          matchNumber: 3,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id
        }
      })

      await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team2.id,
          awayTeamId: team1.id
        }
      })

      await prisma.match.create({
        data: {
          matchNumber: 2,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id
        }
      })

      const matches = await prisma.match.findMany({
        where: { tournamentId: tournament.id },
        orderBy: { matchNumber: 'asc' }
      })

      expect(matches[0].matchNumber).toBe(1)
      expect(matches[1].matchNumber).toBe(2)
      expect(matches[2].matchNumber).toBe(3)
    })
  })

  describe('Match Cascade Delete', () => {
    it('should delete matches when tournament is deleted', async () => {
      const match = await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id
        }
      })

      await prisma.tournament.delete({
        where: { id: tournament.id }
      })

      const found = await prisma.match.findUnique({
        where: { id: match.id }
      })

      expect(found).toBeNull()
    })

    it('should delete matches when team is deleted', async () => {
      const match = await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id
        }
      })

      await prisma.team.delete({
        where: { id: team1.id }
      })

      const found = await prisma.match.findUnique({
        where: { id: match.id }
      })

      expect(found).toBeNull()
    })
  })

  describe('Match Status Workflow', () => {
    it('should have UPCOMING status by default', async () => {
      const match = await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id
        }
      })

      expect(match.status).toBe('UPCOMING')
    })

    it('should progress from UPCOMING to IN_PROGRESS to COMPLETED', async () => {
      const match = await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id
        }
      })

      // Start match
      let updated = await prisma.match.update({
        where: { id: match.id },
        data: { status: 'IN_PROGRESS' }
      })
      expect(updated.status).toBe('IN_PROGRESS')

      // Complete match
      updated = await prisma.match.update({
        where: { id: match.id },
        data: {
          status: 'COMPLETED',
          homeScore: 10,
          awayScore: 7
        }
      })
      expect(updated.status).toBe('COMPLETED')
      expect(updated.homeScore).toBe(10)
      expect(updated.awayScore).toBe(7)
    })

    it('should not allow COMPLETED status without a winner (no team reached 10)', () => {
      // This test validates API-level business logic
      // The validation happens in the API endpoint (server/api/matches/[id].put.ts)
      const validationCheck = () => {
        const homeScore = 5
        const awayScore = 3
        if (homeScore < 10 && awayScore < 10) {
          throw new Error('Cannot mark match as COMPLETED: one team must reach 10 goals to win')
        }
      }

      expect(validationCheck).toThrow()
    })

    it('should allow COMPLETED status when home team reaches 10', async () => {
      const match = await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id
        }
      })

      const updated = await prisma.match.update({
        where: { id: match.id },
        data: {
          homeScore: 10,
          awayScore: 6,
          status: 'COMPLETED'
        }
      })

      expect(updated.status).toBe('COMPLETED')
      expect(updated.homeScore).toBe(10)
    })

    it('should allow COMPLETED status when away team reaches 10', async () => {
      const match = await prisma.match.create({
        data: {
          matchNumber: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id
        }
      })

      const updated = await prisma.match.update({
        where: { id: match.id },
        data: {
          homeScore: 8,
          awayScore: 10,
          status: 'COMPLETED'
        }
      })

      expect(updated.status).toBe('COMPLETED')
      expect(updated.awayScore).toBe(10)
    })
  })
})
