import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

const EXPORT_VERSION = 1

// Build a Book create-input from a file row, dropping IDs/timestamps so rows
// get fresh values and never collide with existing data or other accounts.
function bookData(b: any, userId: string) {
  return {
    isbn: b.isbn ?? undefined,
    title: b.title,
    author: b.author,
    publisher: b.publisher ?? undefined,
    publicationYear: b.publicationYear ?? undefined,
    genre: b.genre ?? undefined,
    description: b.description ?? undefined,
    coverUrl: b.coverUrl ?? undefined,
    pageCount: b.pageCount ?? undefined,
    status: b.status || 'unread',
    rating: b.rating ?? undefined,
    personalNotes: b.personalNotes ?? undefined,
    tags: b.tags ?? undefined,
    userId,
  }
}

function wishlistData(w: any, userId: string) {
  return {
    isbn: w.isbn ?? undefined,
    title: w.title,
    author: w.author,
    publisher: w.publisher ?? undefined,
    publicationYear: w.publicationYear ?? undefined,
    genre: w.genre ?? undefined,
    description: w.description ?? undefined,
    coverUrl: w.coverUrl ?? undefined,
    pageCount: w.pageCount ?? undefined,
    priority: w.priority || 'medium',
    notes: w.notes ?? undefined,
    tags: w.tags ?? undefined,
    userId,
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const mode = url.searchParams.get('mode') === 'replace' ? 'replace' : 'append'

    let data: any
    try {
      data = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (data?.version !== EXPORT_VERSION) {
      return NextResponse.json(
        { error: `Unsupported export version ${data?.version}` },
        { status: 400 }
      )
    }

    const books: any[] = Array.isArray(data.books) ? data.books : []
    const wishlist: any[] = Array.isArray(data.wishlist) ? data.wishlist : []

    // Required fields — skip rows missing them.
    const validBooks = books
      .filter((b) => b?.title && b?.author)
      .map((b) => bookData(b, user.userId))
    const validWishlist = wishlist
      .filter((w) => w?.title && w?.author)
      .map((w) => wishlistData(w, user.userId))

    const result = await prisma.$transaction(async (tx) => {
      if (mode === 'replace') {
        await tx.book.deleteMany({ where: { userId: user.userId } })
        await tx.wishlistItem.deleteMany({ where: { userId: user.userId } })
      }

      const booksCreated = await tx.book.createMany({ data: validBooks })
      const wishlistCreated = await tx.wishlistItem.createMany({ data: validWishlist })

      return {
        booksImported: booksCreated.count,
        wishlistImported: wishlistCreated.count,
      }
    })

    return NextResponse.json({ mode, ...result })
  } catch (error) {
    console.error('Error importing data:', error)
    return NextResponse.json({ error: 'Failed to import data' }, { status: 500 })
  }
}
