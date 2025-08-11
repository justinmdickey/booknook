import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { message: 'All cookies cleared' },
    { status: 200 }
  )

  // Clear all possible auth cookies
  response.cookies.delete('auth-token')
  response.cookies.set('auth-token', '', { 
    expires: new Date(0),
    path: '/'
  })

  return response
}