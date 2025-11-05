export interface GoogleBookVolume {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    publisher?: string
    publishedDate?: string
    description?: string
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
    pageCount?: number
    categories?: string[]
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
  }
}

export interface GoogleBooksResponse {
  items?: GoogleBookVolume[]
  totalItems: number
}

export interface SearchOptions {
  maxResults?: number
  startIndex?: number
}

export async function searchGoogleBooks(
  query: string, 
  options: SearchOptions = {}
): Promise<GoogleBooksResponse> {
  const { maxResults = 40, startIndex = 0 } = options
  const encodedQuery = encodeURIComponent(query)
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=${maxResults}&startIndex=${startIndex}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error searching Google Books:', error)
    return { totalItems: 0, items: [] }
  }
}

export function parseGoogleBook(volume: GoogleBookVolume) {
  const { volumeInfo } = volume
  
  const isbn = volumeInfo.industryIdentifiers?.find(
    id => id.type === 'ISBN_13' || id.type === 'ISBN_10'
  )?.identifier
  
  const year = volumeInfo.publishedDate 
    ? parseInt(volumeInfo.publishedDate.substring(0, 4))
    : undefined
  
  return {
    title: volumeInfo.title,
    author: volumeInfo.authors?.join(', ') || 'Unknown Author',
    isbn: isbn || undefined,
    publisher: volumeInfo.publisher || undefined,
    publicationYear: year || undefined,
    description: volumeInfo.description || undefined,
    pageCount: volumeInfo.pageCount || undefined,
    genre: volumeInfo.categories?.[0] || undefined,
    coverUrl: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || undefined,
  }
}