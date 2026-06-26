import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

const EXPORT_VERSION = 1

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [books, wishlist] = await Promise.all([
      prisma.book.findMany({
        where: { userId: user.userId },
        orderBy: { dateAdded: 'asc' },
      }),
      prisma.wishlistItem.findMany({
        where: { userId: user.userId },
        orderBy: { dateAdded: 'asc' },
      }),
    ])

    const data = {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      books,
      wishlist,
    }

    const date = new Date().toISOString().slice(0, 10)
    const filename = `booknook-export-${date}.json`

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}
