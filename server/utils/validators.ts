import { z } from 'zod'

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(100)
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

// Tournament schemas
export const createTournamentSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  date: z.string().datetime().or(z.date())
})

export const updateTournamentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  date: z.string().datetime().or(z.date()).optional(),
  status: z.enum(['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional()
})

// Team schemas
export const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  player1Name: z.string().min(1).max(100),
  player2Name: z.string().min(1).max(100)
})

export const updateTeamSchema = createTeamSchema.partial()

// Match schemas
// Baby-foot rules: First team to reach 10 goals wins
export const updateMatchSchema = z.object({
  homeScore: z.number().int().min(0).max(10).optional(),
  awayScore: z.number().int().min(0).max(10).optional(),
  status: z.enum(['UPCOMING', 'IN_PROGRESS', 'COMPLETED']).optional()
})
