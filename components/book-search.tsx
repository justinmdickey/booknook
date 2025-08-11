'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Plus } from 'lucide-react'
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
}

export function BookSearch({ onAddBook }: BookSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

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
                  <Button
                    onClick={() => onAddBook(book)}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}