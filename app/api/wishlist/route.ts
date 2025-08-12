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
    const priority = searchParams.get('priority')
    const tag = searchParams.get('tag')
    
    let wishlistItems
    
    if (search) {
      const searchLower = search.toLowerCase()
      // Get all wishlist items first, then filter in JavaScript for case-insensitive search
      const allItems = await prisma.wishlistItem.findMany({
        where: { userId: user.userId },
        orderBy: [
          { priority: 'desc' }, // high, medium, low
          { dateAdded: 'desc' }
        ],
      })
      
      wishlistItems = allItems.filter((item: any) => 
        item.title.toLowerCase().includes(searchLower) ||
        item.author.toLowerCase().includes(searchLower) ||
        (item.isbn && item.isbn.toLowerCase().includes(searchLower))
      )
      
      // Apply additional filters
      if (priority) {
        wishlistItems = wishlistItems.filter((item: any) => item.priority === priority)
      }
      if (tag) {
        wishlistItems = wishlistItems.filter((item: any) => {
          if (!item.tags) return false
          try {
            const itemTags = JSON.parse(item.tags)
            return itemTags.includes(tag)
          } catch {
            return false
          }
        })
      }
    } else {
      const where: any = {
        userId: user.userId
      }
      
      if (priority) {
        where.priority = priority
      }
      
      wishlistItems = await prisma.wishlistItem.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { dateAdded: 'desc' }
        ],
      })
      
      // Apply tag filter if specified
      if (tag) {
        wishlistItems = wishlistItems.filter((item: any) => {
          if (!item.tags) return false
          try {
            const itemTags = JSON.parse(item.tags)
            return itemTags.includes(tag)
          } catch {
            return false
          }
        })
      }
    }
    
    return NextResponse.json(wishlistItems)
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const wishlistItem = await prisma.wishlistItem.create({
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
        userId: user.userId,
      },
    })
    
    return NextResponse.json(wishlistItem, { status: 201 })
  } catch (error) {
    console.error('Error creating wishlist item:', error)
    return NextResponse.json({ error: 'Failed to create wishlist item' }, { status: 500 })
  }
}