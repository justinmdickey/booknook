import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  
  return NextResponse.json({
    authenticated: !!user,
    user: user ? { id: user.userId, username: user.username } : null,
    cookie: request.cookies.get('auth-token')?.value ? 'present' : 'missing'
  })
}