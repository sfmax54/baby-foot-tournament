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

  // Sort by: points DESC, goal difference DESC, goals for DESC
  standings.sort((a, b) => {
    if (b.stats.points !== a.stats.points) {
      return b.stats.points - a.stats.points
    }
    if (b.stats.goalDifference !== a.stats.goalDifference) {
      return b.stats.goalDifference - a.stats.goalDifference
    }
    return b.stats.goalsFor - a.stats.goalsFor
  })

  // Add position
  return standings.map((standing, index) => ({
    position: index + 1,
    ...standing
  }))
}
