import { prisma } from '../server/utils/prisma'
import { hashPassword } from '../server/utils/password'
import { signToken } from '../server/utils/jwt'

// Counter to ensure unique usernames/emails
let userCounter = 0

export async function createTestUser(role: 'USER' | 'ADMIN' = 'USER') {
  userCounter++
  const timestamp = Date.now()
  const uniqueId = `${timestamp}_${userCounter}`
  const hashedPassword = await hashPassword('password123')

  const user = await prisma.user.create({
    data: {
      email: role === 'ADMIN' ? `admin${uniqueId}@test.com` : `user${uniqueId}@test.com`,
      username: role === 'ADMIN' ? `admin${uniqueId}` : `user${uniqueId}`,
      password: hashedPassword,
      role
    }
  })

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role as 'USER' | 'ADMIN'
  })

  return { user, token }
}

export async function createTestTournament(userId: string) {
  return await prisma.tournament.create({
    data: {
      name: 'Test Tournament',
      description: 'A test tournament',
      date: new Date('2025-07-15'),
      status: 'UPCOMING',
      createdById: userId
    }
  })
}

export async function createTestTeam(tournamentId: string) {
  return await prisma.team.create({
    data: {
      name: 'Test Team',
      player1Name: 'Alice',
      player2Name: 'Bob',
      tournamentId
    }
  })
}

export function createAuthHeader(token: string) {
  return `auth_token=${token}`
}
