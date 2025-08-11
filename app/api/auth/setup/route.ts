import { NextResponse } from 'next/server'
import { createDefaultUser } from '@/lib/auth'

export async function GET() {
  try {
    await createDefaultUser()
    return NextResponse.json({ message: 'Default user created or already exists' })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Failed to create default user' },
      { status: 500 }
    )
  }
}