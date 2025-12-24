/**
 * Check if all matches in a tournament are completed
 * and update tournament status accordingly
 */
export async function updateTournamentStatus(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      matches: true
    }
  })

  if (!tournament) {
    return null
  }

  // If no matches, tournament should be UPCOMING
  if (tournament.matches.length === 0) {
    if (tournament.status !== 'UPCOMING') {
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { status: 'UPCOMING' }
      })
    }
    return tournament
  }

  // Check match statuses
  const allCompleted = tournament.matches.every(match => match.status === 'COMPLETED')
  const anyInProgress = tournament.matches.some(match => match.status === 'IN_PROGRESS')
  const anyCompleted = tournament.matches.some(match => match.status === 'COMPLETED')

  let newStatus = tournament.status

  // All matches completed → COMPLETED
  if (allCompleted) {
    newStatus = 'COMPLETED'
  }
  // At least one match in progress or completed → IN_PROGRESS
  else if (anyInProgress || anyCompleted) {
    newStatus = 'IN_PROGRESS'
  }
  // All matches upcoming → UPCOMING
  else {
    newStatus = 'UPCOMING'
  }

  // Update if status changed
  if (newStatus !== tournament.status) {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: newStatus }
    })
  }

  return tournament
}

/**
 * Calculate standings/leaderboard for a tournament
 */
export async function calculateStandings(tournamentId: string) {
  const teams = await prisma.team.findMany({
    where: { tournamentId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      },
      homeMatches: {
        where: {
          status: 'COMPLETED'
        }
      },
      awayMatches: {
        where: {
          status: 'COMPLETED'
        }
      }
    }
  })

  // Calculate stats for each team
  const standings = teams.map(team => {
    let wins = 0
    let losses = 0
    let draws = 0
    let goalsFor = 0
    let goalsAgainst = 0

    // Process home matches
    team.homeMatches.forEach(match => {
      if (match.homeScore !== null && match.awayScore !== null) {
        goalsFor += match.homeScore
        goalsAgainst += match.awayScore

        if (match.homeScore > match.awayScore) {
          wins++
        } else if (match.homeScore < match.awayScore) {
          losses++
        } else {
          draws++
        }
      }
    })

    // Process away matches
    team.awayMatches.forEach(match => {
      if (match.homeScore !== null && match.awayScore !== null) {
        goalsFor += match.awayScore
        goalsAgainst += match.homeScore

        if (match.awayScore > match.homeScore) {
          wins++
        } else if (match.awayScore < match.homeScore) {
          losses++
        } else {
          draws++
        }
      }
    })

    const played = wins + losses + draws
    const points = wins * 3 + draws * 1 // 3 points for win, 1 for draw
    const goalDifference = goalsFor - goalsAgainst

    return {
      team: {
        id: team.id,
        name: team.name,
        player1Name: team.player1Name,
        player2Name: team.player2Name,
        members: team.members
      },
      stats: {
        played,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points
      }
    }
  })

  // Sort by: points DESC, goal difference DESC, goals for DESC, goals against ASC, team name ASC
  standings.sort((a, b) => {
    // 1. Points (primary criterion)
    if (b.stats.points !== a.stats.points) {
      return b.stats.points - a.stats.points
    }
    // 2. Goal difference (secondary criterion)
    if (b.stats.goalDifference !== a.stats.goalDifference) {
      return b.stats.goalDifference - a.stats.goalDifference
    }
    // 3. Goals for (tertiary criterion)
    if (b.stats.goalsFor !== a.stats.goalsFor) {
      return b.stats.goalsFor - a.stats.goalsFor
    }
    // 4. Goals against - fewer is better (quaternary criterion)
    if (a.stats.goalsAgainst !== b.stats.goalsAgainst) {
      return a.stats.goalsAgainst - b.stats.goalsAgainst
    }
    // 5. Team name alphabetically (for stable sorting when perfect tie)
    return a.team.name.localeCompare(b.team.name)
  })

  // Add position with tie handling
  let currentPosition = 1
  return standings.map((standing, index) => {
    // If not first team, check if tied with previous team
    if (index > 0) {
      const prev = standings[index - 1]
      const isTied =
        standing.stats.points === prev.stats.points &&
        standing.stats.goalDifference === prev.stats.goalDifference &&
        standing.stats.goalsFor === prev.stats.goalsFor &&
        standing.stats.goalsAgainst === prev.stats.goalsAgainst

      if (!isTied) {
        currentPosition = index + 1
      }
    }

    return {
      position: currentPosition,
      ...standing
    }
  })
}
