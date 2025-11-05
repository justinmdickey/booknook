import { NextRequest, NextResponse } from 'next/server'
import { searchGoogleBooks, parseGoogleBook } from '@/lib/google-books'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const startIndex = parseInt(searchParams.get('startIndex') || '0', 10)
    const maxResults = parseInt(searchParams.get('maxResults') || '40', 10)
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }
    
    const response = await searchGoogleBooks(query, { startIndex, maxResults })
    
    if (!response.items || response.items.length === 0) {
      return NextResponse.json({ books: [], totalItems: response.totalItems })
    }
    
    const books = response.items.map(parseGoogleBook)
    
    return NextResponse.json({ books, totalItems: response.totalItems })
  } catch (error) {
    console.error('Error searching books:', error)
    return NextResponse.json({ error: 'Failed to search books' }, { status: 500 })
  }
}