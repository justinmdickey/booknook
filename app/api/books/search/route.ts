import { NextRequest, NextResponse } from 'next/server'
import { searchGoogleBooks, parseGoogleBook } from '@/lib/google-books'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }
    
    const response = await searchGoogleBooks(query)
    
    if (!response.items || response.items.length === 0) {
      return NextResponse.json({ books: [] })
    }
    
    const books = response.items.map(parseGoogleBook)
    
    return NextResponse.json({ books })
  } catch (error) {
    console.error('Error searching books:', error)
    return NextResponse.json({ error: 'Failed to search books' }, { status: 500 })
  }
}