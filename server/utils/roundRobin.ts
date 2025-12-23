import { prisma } from './prisma'

interface Team {
  id: string
  name: string
}

export interface MatchPairing {
  homeTeamId: string
  awayTeamId: string
  matchNumber: number
}

/**
 * Generates all possible pairings for a round-robin tournament
 * Each team plays every other team exactly once
 */
export function generateRoundRobinPairings(teams: Team[]): MatchPairing[] {
  const pairings: MatchPairing[] = []
  let matchNumber = 1

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      pairings.push({
        homeTeamId: teams[i].id,
        awayTeamId: teams[j].id,
        matchNumber: matchNumber++
      })
    }
  }

  return pairings
}

/**
 * Creates matches in the database for a tournament
 */
export async function createRoundRobinMatches(tournamentId: string) {
  // Get all teams for this tournament
  const teams = await prisma.team.findMany({
    where: { tournamentId },
    select: { id: true, name: true }
  })

  if (teams.length < 2) {
    throw new Error('At least 2 teams required to generate matches')
  }

  // Generate pairings
  const pairings = generateRoundRobinPairings(teams)

  // Create matches in database
  const matches = await prisma.match.createMany({
    data: pairings.map(pairing => ({
      tournamentId,
      homeTeamId: pairing.homeTeamId,
      awayTeamId: pairing.awayTeamId,
      matchNumber: pairing.matchNumber,
      status: 'UPCOMING' as const
    }))
  })

  return matches
}
