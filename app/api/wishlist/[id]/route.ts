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

    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: { 
        id: id,
        userId: user.userId
      },
    })
    
    if (!wishlistItem) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 })
    }
    
    return NextResponse.json(wishlistItem)
  } catch (error) {
    console.error('Error fetching wishlist item:', error)
    return NextResponse.json({ error: 'Failed to fetch wishlist item' }, { status: 500 })
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
    
    const wishlistItem = await prisma.wishlistItem.updateMany({
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
        priority: body.priority || 'medium',
        notes: body.notes || undefined,
        tags: body.tags ? (typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags)) : undefined,
      },
    })
    
    if (wishlistItem.count === 0) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 })
    }
    
    const updatedItem = await prisma.wishlistItem.findFirst({
      where: { id: id, userId: user.userId }
    })
    
    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating wishlist item:', error)
    return NextResponse.json({ error: 'Failed to update wishlist item' }, { status: 500 })
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

    const result = await prisma.wishlistItem.deleteMany({
      where: { 
        id: id,
        userId: user.userId
      },
    })
    
    if (result.count === 0) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Wishlist item deleted successfully' })
  } catch (error) {
    console.error('Error deleting wishlist item:', error)
    return NextResponse.json({ error: 'Failed to delete wishlist item' }, { status: 500 })
  }
}