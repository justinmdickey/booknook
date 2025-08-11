import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { getCookie, setCookie, deleteCookie } from 'cookies-next'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface JWTPayload {
  userId: string
  username: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getUserFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  const token = req.cookies.get('auth-token')?.value
  console.log('Token from cookie:', token ? 'exists' : 'missing')
  
  if (!token || typeof token !== 'string') {
    console.log('No valid token')
    return null
  }
  
  const payload = verifyToken(token)
  console.log('Token payload:', payload)
  return payload
}

export async function createDefaultUser() {
  const defaultUsername = process.env.DEFAULT_USERNAME || 'admin'
  const defaultPassword = process.env.DEFAULT_PASSWORD || 'changeme'
  
  const existingUser = await prisma.user.findUnique({
    where: { username: defaultUsername }
  })
  
  if (!existingUser) {
    const passwordHash = await hashPassword(defaultPassword)
    await prisma.user.create({
      data: {
        username: defaultUsername,
        passwordHash
      }
    })
    console.log(`Default user created: ${defaultUsername}`)
  }
}