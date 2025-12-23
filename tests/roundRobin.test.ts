import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../server/utils/prisma'
import { generateRoundRobinPairings, createRoundRobinMatches } from '../server/utils/roundRobin'
import { createTestUser, createTestTournament } from './helpers'

describe('Round-Robin Algorithm', () => {
  let adminUser: Awaited<ReturnType<typeof createTestUser>>
  let tournament: Awaited<ReturnType<typeof createTestTournament>>

  beforeEach(async () => {
    adminUser = await createTestUser('ADMIN')
    tournament = await createTestTournament(adminUser.user.id)
  })

  describe('generateRoundRobinPairings', () => {
    it('should generate correct number of pairings for 2 teams', () => {
      const teams = [
        { id: '1', name: 'Team 1' },
        { id: '2', name: 'Team 2' }
      ]

      const pairings = generateRoundRobinPairings(teams)

      // Formula: n(n-1)/2 = 2(1)/2 = 1
      expect(pairings).toHaveLength(1)
      expect(pairings[0].homeTeamId).toBe('1')
      expect(pairings[0].awayTeamId).toBe('2')
      expect(pairings[0].matchNumber).toBe(1)
    })

    it('should generate correct number of pairings for 3 teams', () => {
      const teams = [
        { id: '1', name: 'Team 1' },
        { id: '2', name: 'Team 2' },
        { id: '3', name: 'Team 3' }
      ]

      const pairings = generateRoundRobinPairings(teams)

      // Formula: 3(2)/2 = 3
      expect(pairings).toHaveLength(3)
    })

    it('should generate correct number of pairings for 4 teams', () => {
      const teams = [
        { id: '1', name: 'Team 1' },
        { id: '2', name: 'Team 2' },
        { id: '3', name: 'Team 3' },
        { id: '4', name: 'Team 4' }
      ]

      const pairings = generateRoundRobinPairings(teams)

      // Formula: 4(3)/2 = 6
      expect(pairings).toHaveLength(6)
    })

    it('should generate correct number of pairings for 8 teams', () => {
      const teams = Array.from({ length: 8 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Team ${i + 1}`
      }))

      const pairings = generateRoundRobinPairings(teams)

      // Formula: 8(7)/2 = 28
      expect(pairings).toHaveLength(28)
    })

    it('should assign sequential match numbers', () => {
      const teams = [
        { id: '1', name: 'Team 1' },
        { id: '2', name: 'Team 2' },
        { id: '3', name: 'Team 3' },
        { id: '4', name: 'Team 4' }
      ]

      const pairings = generateRoundRobinPairings(teams)

      const matchNumbers = pairings.map(p => p.matchNumber)
      expect(matchNumbers).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('should ensure each team plays every other team exactly once', () => {
      const teams = [
        { id: '1', name: 'Team 1' },
        { id: '2', name: 'Team 2' },
        { id: '3', name: 'Team 3' }
      ]

      const pairings = generateRoundRobinPairings(teams)

      // Team 1 should play against Team 2 and Team 3
      const team1Matches = pairings.filter(p =>
        p.homeTeamId === '1' || p.awayTeamId === '1'
      )
      expect(team1Matches).toHaveLength(2)

      // Verify Team 1 plays against Team 2
      const vsTeam2 = pairings.find(p =>
        (p.homeTeamId === '1' && p.awayTeamId === '2') ||
        (p.homeTeamId === '2' && p.awayTeamId === '1')
      )
      expect(vsTeam2).toBeDefined()

      // Verify Team 1 plays against Team 3
      const vsTeam3 = pairings.find(p =>
        (p.homeTeamId === '1' && p.awayTeamId === '3') ||
        (p.homeTeamId === '3' && p.awayTeamId === '1')
      )
      expect(vsTeam3).toBeDefined()
    })

    it('should not have duplicate pairings', () => {
      const teams = [
        { id: '1', name: 'Team 1' },
        { id: '2', name: 'Team 2' },
        { id: '3', name: 'Team 3' },
        { id: '4', name: 'Team 4' }
      ]

      const pairings = generateRoundRobinPairings(teams)

      // Check for duplicates
      const pairSet = new Set<string>()
      pairings.forEach(p => {
        const key = [p.homeTeamId, p.awayTeamId].sort().join('-')
        expect(pairSet.has(key)).toBe(false)
        pairSet.add(key)
      })
    })

    it('should return empty array for 0 teams', () => {
      const teams: any[] = []
      const pairings = generateRoundRobinPairings(teams)
      expect(pairings).toHaveLength(0)
    })

    it('should return empty array for 1 team', () => {
      const teams = [{ id: '1', name: 'Team 1' }]
      const pairings = generateRoundRobinPairings(teams)
      expect(pairings).toHaveLength(0)
    })
  })

  describe('createRoundRobinMatches', () => {
    it('should create matches in database', async () => {
      // Create teams
      await prisma.team.createMany({
        data: [
          { name: 'Team 1', player1Name: 'A', player2Name: 'B', tournamentId: tournament.id },
          { name: 'Team 2', player1Name: 'C', player2Name: 'D', tournamentId: tournament.id },
          { name: 'Team 3', player1Name: 'E', player2Name: 'F', tournamentId: tournament.id }
        ]
      })

      const result = await createRoundRobinMatches(tournament.id)

      expect(result.count).toBe(3) // 3 teams = 3 matches

      const matches = await prisma.match.findMany({
        where: { tournamentId: tournament.id },
        orderBy: { matchNumber: 'asc' }
      })

      expect(matches).toHaveLength(3)
      expect(matches[0].matchNumber).toBe(1)
      expect(matches[1].matchNumber).toBe(2)
      expect(matches[2].matchNumber).toBe(3)
    })

    it('should throw error for less than 2 teams', async () => {
      // Create only 1 team
      await prisma.team.create({
        data: {
          name: 'Team 1',
          player1Name: 'A',
          player2Name: 'B',
          tournamentId: tournament.id
        }
      })

      await expect(createRoundRobinMatches(tournament.id)).rejects.toThrow(
        'At least 2 teams required'
      )
    })

    it('should throw error for 0 teams', async () => {
      await expect(createRoundRobinMatches(tournament.id)).rejects.toThrow(
        'At least 2 teams required'
      )
    })

    it('should create matches with UPCOMING status', async () => {
      await prisma.team.createMany({
        data: [
          { name: 'Team 1', player1Name: 'A', player2Name: 'B', tournamentId: tournament.id },
          { name: 'Team 2', player1Name: 'C', player2Name: 'D', tournamentId: tournament.id }
        ]
      })

      await createRoundRobinMatches(tournament.id)

      const matches = await prisma.match.findMany({
        where: { tournamentId: tournament.id }
      })

      matches.forEach(match => {
        expect(match.status).toBe('UPCOMING')
        expect(match.homeScore).toBeNull()
        expect(match.awayScore).toBeNull()
      })
    })

    it('should verify all teams are paired correctly', async () => {
      const teams = await prisma.team.createManyAndReturn({
        data: [
          { name: 'Team 1', player1Name: 'A', player2Name: 'B', tournamentId: tournament.id },
          { name: 'Team 2', player1Name: 'C', player2Name: 'D', tournamentId: tournament.id },
          { name: 'Team 3', player1Name: 'E', player2Name: 'F', tournamentId: tournament.id },
          { name: 'Team 4', player1Name: 'G', player2Name: 'H', tournamentId: tournament.id }
        ]
      })

      await createRoundRobinMatches(tournament.id)

      const matches = await prisma.match.findMany({
        where: { tournamentId: tournament.id }
      })

      // Each team should appear in exactly 3 matches (n-1 matches for n teams)
      teams.forEach(team => {
        const teamMatches = matches.filter(m =>
          m.homeTeamId === team.id || m.awayTeamId === team.id
        )
        expect(teamMatches).toHaveLength(3)
      })
    })
  })

  describe('Real-world Scenarios', () => {
    it('should handle 8-team tournament (28 matches)', async () => {
      await prisma.team.createMany({
        data: Array.from({ length: 8 }, (_, i) => ({
          name: `Team ${i + 1}`,
          player1Name: `Player ${i * 2 + 1}`,
          player2Name: `Player ${i * 2 + 2}`,
          tournamentId: tournament.id
        }))
      })

      const result = await createRoundRobinMatches(tournament.id)
      expect(result.count).toBe(28)

      const matches = await prisma.match.findMany({
        where: { tournamentId: tournament.id }
      })
      expect(matches).toHaveLength(28)

      // Verify match numbers are 1-28
      const matchNumbers = matches.map(m => m.matchNumber).sort((a, b) => a - b)
      expect(matchNumbers).toEqual(Array.from({ length: 28 }, (_, i) => i + 1))
    })

    it('should isolate matches between tournaments', async () => {
      const tournament2 = await createTestTournament(adminUser.user.id)

      // Tournament 1: 3 teams
      await prisma.team.createMany({
        data: [
          { name: 'T1 Team 1', player1Name: 'A', player2Name: 'B', tournamentId: tournament.id },
          { name: 'T1 Team 2', player1Name: 'C', player2Name: 'D', tournamentId: tournament.id },
          { name: 'T1 Team 3', player1Name: 'E', player2Name: 'F', tournamentId: tournament.id }
        ]
      })

      // Tournament 2: 2 teams
      await prisma.team.createMany({
        data: [
          { name: 'T2 Team 1', player1Name: 'G', player2Name: 'H', tournamentId: tournament2.id },
          { name: 'T2 Team 2', player1Name: 'I', player2Name: 'J', tournamentId: tournament2.id }
        ]
      })

      await createRoundRobinMatches(tournament.id)
      await createRoundRobinMatches(tournament2.id)

      const matches1 = await prisma.match.findMany({
        where: { tournamentId: tournament.id }
      })
      const matches2 = await prisma.match.findMany({
        where: { tournamentId: tournament2.id }
      })

      expect(matches1).toHaveLength(3)
      expect(matches2).toHaveLength(1)
    })
  })
})
