import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('Books API called')
    const user = await getUserFromRequest(request)
    console.log('User from token:', user)
    if (!user) {
      console.log('No user found, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const genre = searchParams.get('genre')
    
    let books
    
    if (search) {
      const searchLower = search.toLowerCase()
      // Get all books first, then filter in JavaScript for case-insensitive search
      const allBooks = await prisma.book.findMany({
        where: { userId: user.userId },
        orderBy: [
          { author: 'asc' },
          { title: 'asc' }
        ],
      })
      
      books = allBooks.filter((book: any) => 
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower) ||
        (book.isbn && book.isbn.toLowerCase().includes(searchLower))
      )
      
      // Apply additional filters
      if (status) {
        books = books.filter((book: any) => book.status === status)
      }
      if (genre) {
        books = books.filter((book: any) => book.genre === genre)
      }
    } else {
      const where: any = {
        userId: user.userId
      }
      
      if (status) {
        where.status = status
      }
      
      if (genre) {
        where.genre = genre
      }
      
      books = await prisma.book.findMany({
        where,
        orderBy: [
          { author: 'asc' },
          { title: 'asc' }
        ],
      })
    }
    
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