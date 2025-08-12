'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Plus, Check, Heart } from 'lucide-react'
import Image from 'next/image'

interface SearchResult {
  title: string
  author: string
  isbn?: string
  publisher?: string
  publicationYear?: number
  description?: string
  pageCount?: number
  genre?: string
  coverUrl?: string
}

interface BookSearchProps {
  onAddBook: (book: SearchResult) => void
  onAddToWishlist?: (book: SearchResult) => void
}

export function BookSearch({ onAddBook, onAddToWishlist }: BookSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [existingBooks, setExistingBooks] = useState<{title: string, author: string, isbn?: string}[]>([])

  useEffect(() => {
    // Fetch existing books when component mounts
    const fetchExistingBooks = async () => {
      try {
        const response = await fetch('/api/books')
        const books = await response.json()
        setExistingBooks(books.map((book: any) => ({
          title: book.title.toLowerCase(),
          author: book.author.toLowerCase(),
          isbn: book.isbn
        })))
      } catch (error) {
        console.error('Failed to fetch existing books:', error)
      }
    }
    
    fetchExistingBooks()
  }, [])

  const isBookAlreadyAdded = (book: SearchResult) => {
    return existingBooks.some(existing => {
      // Check by ISBN first (most reliable)
      if (book.isbn && existing.isbn && book.isbn === existing.isbn) {
        return true
      }
      
      // Fallback to title and author match
      const bookTitle = book.title.toLowerCase()
      const bookAuthor = book.author.toLowerCase()
      
      return existing.title === bookTitle && existing.author === bookAuthor
    })
  }

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data.books || [])
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search for books by title, author, or ISBN..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {loading && (
        <div className="text-center py-8 text-muted-foreground">
          Searching...
        </div>
      )}

      {results.length > 0 && (
        <div className="grid gap-4">
          {results.map((book, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex gap-3">
                  {book.coverUrl && (
                    <div className="relative w-12 h-16 flex-shrink-0">
                      <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover rounded"
                        sizes="48px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base line-clamp-1">{book.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
                    {book.publicationYear && (
                      <p className="text-xs text-muted-foreground">
                        Published: {book.publicationYear}
                      </p>
                    )}
                    {book.description && (
                      <p className="text-xs mt-1 line-clamp-2 text-muted-foreground">{book.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {isBookAlreadyAdded(book) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0"
                        disabled
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Already Added
                      </Button>
                    ) : (
                      <Button
                        onClick={() => onAddBook(book)}
                        size="sm"
                        className="flex-shrink-0"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Library
                      </Button>
                    )}
                    {onAddToWishlist && (
                      <Button
                        onClick={() => onAddToWishlist(book)}
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        Add to Wishlist
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}