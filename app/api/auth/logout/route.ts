import { NextRequest, NextResponse } from 'next/server'
import { deleteCookie } from 'cookies-next'

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { message: 'Logout successful' },
    { status: 200 }
  )

  deleteCookie('auth-token', {
    req: request,
    res: response
  })

  return response
}