import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { prisma } from '../server/utils/prisma'
import { createTestUser, createTestTournament } from './helpers'
import { createTournamentSchema, updateTournamentSchema } from '../server/utils/validators'

describe('Tournaments', () => {
  let adminUser: Awaited<ReturnType<typeof createTestUser>>
  let regularUser: Awaited<ReturnType<typeof createTestUser>>

  beforeEach(async () => {
    adminUser = await createTestUser('ADMIN')
    regularUser = await createTestUser('USER')
  })

  afterEach(async () => {
    // Clean up after each test
    await prisma.teamMember.deleteMany()
    await prisma.match.deleteMany()
    await prisma.team.deleteMany()
    await prisma.tournament.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('Tournament Validation', () => {
    it('should validate correct tournament data', () => {
      const data = {
        name: 'Summer Tournament',
        description: 'Annual summer event',
        date: new Date('2025-07-15').toISOString()
      }

      const result = createTournamentSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const data = {
        name: '',
        date: new Date('2025-07-15').toISOString()
      }

      const result = createTournamentSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should allow optional description', () => {
      const data = {
        name: 'Test Tournament',
        date: new Date('2025-07-15').toISOString()
      }

      const result = createTournamentSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate update schema with partial data', () => {
      const data = {
        name: 'Updated Name'
      }

      const result = updateTournamentSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate status in update schema', () => {
      const data = {
        status: 'IN_PROGRESS'
      }

      const result = updateTournamentSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid status', () => {
      const data = {
        status: 'INVALID_STATUS'
      }

      const result = updateTournamentSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('Tournament CRUD Operations', () => {
    it('should create a tournament', async () => {
      const tournament = await prisma.tournament.create({
        data: {
          name: 'Test Tournament',
          description: 'A test tournament',
          date: new Date('2025-07-15'),
          status: 'UPCOMING',
          createdById: adminUser.user.id
        }
      })

      expect(tournament.id).toBeDefined()
      expect(tournament.name).toBe('Test Tournament')
      expect(tournament.status).toBe('UPCOMING')
      expect(tournament.createdById).toBe(adminUser.user.id)
    })

    it('should list all tournaments', async () => {
      await createTestTournament(adminUser.user.id)
      await createTestTournament(adminUser.user.id)

      const tournaments = await prisma.tournament.findMany()
      expect(tournaments).toHaveLength(2)
    })

    it('should find tournament by id with relations', async () => {
      const created = await createTestTournament(adminUser.user.id)

      const tournament = await prisma.tournament.findUnique({
        where: { id: created.id },
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          teams: true,
          matches: true
        }
      })

      expect(tournament).toBeDefined()
      expect(tournament?.createdBy.id).toBe(adminUser.user.id)
      expect(tournament?.teams).toEqual([])
      expect(tournament?.matches).toEqual([])
    })

    it('should update tournament', async () => {
      const tournament = await createTestTournament(adminUser.user.id)

      const updated = await prisma.tournament.update({
        where: { id: tournament.id },
        data: {
          name: 'Updated Tournament',
          status: 'IN_PROGRESS'
        }
      })

      expect(updated.name).toBe('Updated Tournament')
      expect(updated.status).toBe('IN_PROGRESS')
    })

    it('should delete tournament', async () => {
      const tournament = await createTestTournament(adminUser.user.id)

      await prisma.tournament.delete({
        where: { id: tournament.id }
      })

      const found = await prisma.tournament.findUnique({
        where: { id: tournament.id }
      })

      expect(found).toBeNull()
    })

    it('should cascade delete teams and matches when tournament is deleted', async () => {
      const tournament = await createTestTournament(adminUser.user.id)

      const team = await prisma.team.create({
        data: {
          name: 'Test Team',
          player1Name: 'Alice',
          player2Name: 'Bob',
          tournamentId: tournament.id
        }
      })

      // Delete tournament
      await prisma.tournament.delete({
        where: { id: tournament.id }
      })

      // Check team was also deleted
      const foundTeam = await prisma.team.findUnique({
        where: { id: team.id }
      })

      expect(foundTeam).toBeNull()
    })
  })

  describe('Tournament Status', () => {
    it('should have UPCOMING status by default', async () => {
      const tournament = await createTestTournament(adminUser.user.id)
      expect(tournament.status).toBe('UPCOMING')
    })

    it('should update status to IN_PROGRESS', async () => {
      const tournament = await createTestTournament(adminUser.user.id)

      const updated = await prisma.tournament.update({
        where: { id: tournament.id },
        data: { status: 'IN_PROGRESS' }
      })

      expect(updated.status).toBe('IN_PROGRESS')
    })

    it('should update status to COMPLETED', async () => {
      const tournament = await createTestTournament(adminUser.user.id)

      const updated = await prisma.tournament.update({
        where: { id: tournament.id },
        data: { status: 'COMPLETED' }
      })

      expect(updated.status).toBe('COMPLETED')
    })

    it('should update status to CANCELLED', async () => {
      const tournament = await createTestTournament(adminUser.user.id)

      const updated = await prisma.tournament.update({
        where: { id: tournament.id },
        data: { status: 'CANCELLED' }
      })

      expect(updated.status).toBe('CANCELLED')
    })
  })

  describe('Tournament Queries', () => {
    it('should order tournaments by date descending', async () => {
      await prisma.tournament.create({
        data: {
          name: 'Tournament 1',
          date: new Date('2025-01-01'),
          createdById: adminUser.user.id
        }
      })

      await prisma.tournament.create({
        data: {
          name: 'Tournament 2',
          date: new Date('2025-12-31'),
          createdById: adminUser.user.id
        }
      })

      const tournaments = await prisma.tournament.findMany({
        orderBy: { date: 'desc' }
      })

      expect(tournaments[0].name).toBe('Tournament 2')
      expect(tournaments[1].name).toBe('Tournament 1')
    })

    it('should count teams and matches', async () => {
      const tournament = await createTestTournament(adminUser.user.id)

      await prisma.team.createMany({
        data: [
          { name: 'Team 1', player1Name: 'A', player2Name: 'B', tournamentId: tournament.id },
          { name: 'Team 2', player1Name: 'C', player2Name: 'D', tournamentId: tournament.id }
        ]
      })

      const result = await prisma.tournament.findUnique({
        where: { id: tournament.id },
        include: {
          _count: {
            select: {
              teams: true,
              matches: true
            }
          }
        }
      })

      expect(result?._count.teams).toBe(2)
      expect(result?._count.matches).toBe(0)
    })
  })
})
