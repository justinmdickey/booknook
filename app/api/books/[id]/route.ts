import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const book = await prisma.book.findFirst({
      where: { 
        id: id,
        userId: user.userId
      },
    })
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }
    
    return NextResponse.json(book)
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const book = await prisma.book.updateMany({
      where: { 
        id: id,
        userId: user.userId
      },
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
        status: body.status,
        rating: body.rating || undefined,
        personalNotes: body.personalNotes || undefined,
        tags: body.tags ? JSON.stringify(body.tags) : undefined,
      },
    })
    
    if (book.count === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }
    
    const updatedBook = await prisma.book.findFirst({
      where: { id: id, userId: user.userId }
    })
    
    return NextResponse.json(updatedBook)
  } catch (error) {
    console.error('Error updating book:', error)
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await prisma.book.deleteMany({
      where: { 
        id: id,
        userId: user.userId
      },
    })
    
    if (result.count === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Book deleted successfully' })
  } catch (error) {
    console.error('Error deleting book:', error)
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 })
  }
}