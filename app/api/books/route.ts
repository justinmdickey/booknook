import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const genre = searchParams.get('genre')
    
    const where: any = {
      userId: user.userId
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (status) {
      where.status = status
    }
    
    if (genre) {
      where.genre = genre
    }
    
    const books = await prisma.book.findMany({
      where,
      orderBy: [
        { author: 'asc' },
        { title: 'asc' }
      ],
    })
    
    return NextResponse.json(books)
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const book = await prisma.book.create({
      data: {
        title: body.title,
        author: body.author,
        isbn: body.isbn || undefined,
        publisher: body.publisher || undefined,
        publicationYear: body.publicationYear || undefined,
        genre: body.genre || undefined,
        description: body.description || undefined,
        coverUrl: body.coverUrl || undefined,
        pageCount: body.pageCount || undefined,
        status: body.status || 'unread',
        rating: body.rating || undefined,
        personalNotes: body.personalNotes || undefined,
        tags: body.tags ? JSON.stringify(body.tags) : undefined,
        userId: user.userId,
      },
    })
    
    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    console.error('Error creating book:', error)
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 })
  }
}