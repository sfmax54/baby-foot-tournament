import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../server/utils/prisma'
import { hashPassword, comparePassword } from '../server/utils/password'
import { signToken, verifyToken } from '../server/utils/jwt'
import { registerSchema, loginSchema } from '../server/utils/validators'

describe('Authentication', () => {
  beforeEach(async () => {
    await prisma.match.deleteMany()
    await prisma.team.deleteMany()
    await prisma.tournament.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('Password Utilities', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123'
      const hashed = await hashPassword(password)

      expect(hashed).toBeDefined()
      expect(hashed).not.toBe(password)
      expect(hashed.length).toBeGreaterThan(0)
    })

    it('should verify correct password', async () => {
      const password = 'testpassword123'
      const hashed = await hashPassword(password)
      const isValid = await comparePassword(password, hashed)

      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testpassword123'
      const hashed = await hashPassword(password)
      const isValid = await comparePassword('wrongpassword', hashed)

      expect(isValid).toBe(false)
    })
  })

  describe('JWT Utilities', () => {
    it('should sign and verify token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'USER' as const
      }

      const token = signToken(payload)
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')

      const verified = verifyToken(token)
      expect(verified).toBeDefined()
      expect(verified?.userId).toBe(payload.userId)
      expect(verified?.email).toBe(payload.email)
      expect(verified?.role).toBe(payload.role)
    })

    it('should return null for invalid token', () => {
      const verified = verifyToken('invalid-token')
      expect(verified).toBeNull()
    })
  })

  describe('Registration Validation', () => {
    it('should validate correct registration data', () => {
      const data = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123'
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject short password', () => {
      const data = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'short'
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject short username', () => {
      const data = {
        email: 'test@example.com',
        username: 'ab',
        password: 'password123'
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('Login Validation', () => {
    it('should validate correct login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123'
      }

      const result = loginSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123'
      }

      const result = loginSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('User Registration Flow', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'newuser@test.com',
        username: 'newuser',
        password: 'password123'
      }

      const hashedPassword = await hashPassword(userData.password)

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          password: hashedPassword,
          role: 'USER'
        }
      })

      expect(user.id).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.username).toBe(userData.username)
      expect(user.role).toBe('USER')
      expect(user.password).not.toBe(userData.password)

      // Verify password
      const isValid = await comparePassword(userData.password, user.password)
      expect(isValid).toBe(true)
    })

    it('should not allow duplicate emails', async () => {
      const userData = {
        email: 'duplicate@test.com',
        username: 'user1',
        password: await hashPassword('password123')
      }

      await prisma.user.create({
        data: { ...userData, role: 'USER' }
      })

      // Try to create another user with same email
      await expect(
        prisma.user.create({
          data: {
            email: userData.email,
            username: 'user2',
            password: userData.password,
            role: 'USER'
          }
        })
      ).rejects.toThrow()
    })

    it('should not allow duplicate usernames', async () => {
      const password = await hashPassword('password123')

      await prisma.user.create({
        data: {
          email: 'user1@test.com',
          username: 'duplicate',
          password,
          role: 'USER'
        }
      })

      // Try to create another user with same username
      await expect(
        prisma.user.create({
          data: {
            email: 'user2@test.com',
            username: 'duplicate',
            password,
            role: 'USER'
          }
        })
      ).rejects.toThrow()
    })
  })

  describe('User Roles', () => {
    it('should create user with USER role by default', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'user@test.com',
          username: 'user',
          password: await hashPassword('password123'),
          role: 'USER'
        }
      })

      expect(user.role).toBe('USER')
    })

    it('should create user with ADMIN role when specified', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'admin@test.com',
          username: 'admin',
          password: await hashPassword('password123'),
          role: 'ADMIN'
        }
      })

      expect(user.role).toBe('ADMIN')
    })
  })
})
