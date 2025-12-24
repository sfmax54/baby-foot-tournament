export default defineEventHandler(async (event) => {
  const user = getCurrentUser(event)
  const teamId = getRouterParam(event, 'id')

  if (!teamId) {
    throw createError({
      statusCode: 400,
      message: 'Team ID required'
    })
  }

  // Check if team exists
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: true,
      tournament: {
        include: {
          matches: true
        }
      }
    }
  })

  if (!team) {
    throw createError({
      statusCode: 404,
      message: 'Team not found'
    })
  }

  // Check if matches have already been generated
  if (team.tournament.matches.length > 0) {
    throw createError({
      statusCode: 400,
      message: 'Cannot leave team: matches have already been generated.'
    })
  }

  // Check if user is in this team
  const userMembership = team.members.find(member => member.userId === user.userId)

  if (!userMembership) {
    throw createError({
      statusCode: 403,
      message: 'You are not a member of this team'
    })
  }

  // Delete all team members (this will delete the team if no members remain)
  await prisma.teamMember.deleteMany({
    where: { teamId }
  })

  // Delete the team itself
  await prisma.team.delete({
    where: { id: teamId }
  })

  return {
    success: true,
    message: 'Successfully left the team'
  }
})
