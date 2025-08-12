import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookIds, action, tags } = body

    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return NextResponse.json({ error: 'Book IDs are required' }, { status: 400 })
    }

    if (!action || !tags || !Array.isArray(tags)) {
      return NextResponse.json({ error: 'Action and tags are required' }, { status: 400 })
    }

    // Verify all books belong to the user
    const userBooks = await prisma.book.findMany({
      where: {
        id: { in: bookIds },
        userId: user.userId
      },
      select: { id: true, tags: true }
    })

    if (userBooks.length !== bookIds.length) {
      return NextResponse.json({ error: 'Some books not found or unauthorized' }, { status: 404 })
    }

    // Process each book
    const updatePromises = userBooks.map(async (book) => {
      let existingTags: string[] = []
      
      // Parse existing tags
      if (book.tags) {
        try {
          existingTags = JSON.parse(book.tags)
        } catch (e) {
          existingTags = []
        }
      }

      let newTags: string[] = []

      switch (action) {
        case 'addTags':
          // Add new tags, avoiding duplicates
          const tagsToAdd = tags.filter(tag => !existingTags.includes(tag))
          newTags = [...existingTags, ...tagsToAdd]
          break
        case 'removeTags':
          // Remove specified tags
          newTags = existingTags.filter(tag => !tags.includes(tag))
          break
        case 'replaceTags':
          // Replace all tags
          newTags = tags
          break
        default:
          throw new Error('Invalid action')
      }

      // Update the book
      return prisma.book.update({
        where: { id: book.id },
        data: { tags: JSON.stringify(newTags) }
      })
    })

    await Promise.all(updatePromises)

    return NextResponse.json({ 
      message: `Successfully updated ${userBooks.length} books`,
      updatedCount: userBooks.length 
    })
  } catch (error) {
    console.error('Error in bulk update:', error)
    return NextResponse.json({ error: 'Failed to update books' }, { status: 500 })
  }
}