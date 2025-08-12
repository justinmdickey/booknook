'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookCard } from '@/components/book-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { TagInput } from '@/components/tag-input'
import { Plus, Search, BookOpen, LogOut, Filter, CheckSquare, Square, Tag } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  coverUrl?: string | null
  status: string
  rating?: number | null
  genre?: string | null
  tags?: string | null
}

export default function Home() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    read: 0,
    reading: 0,
    unread: 0,
  })
  const [sortBy, setSortBy] = useState('title')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [allTags, setAllTags] = useState<string[]>([])
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)
  const [showBulkTagEditor, setShowBulkTagEditor] = useState(false)
  const [bulkTags, setBulkTags] = useState<string[]>([])

  useEffect(() => {
    fetchBooks()
  }, [])

  const extractAllTags = (books: Book[]) => {
    const tagSet = new Set<string>()
    books.forEach(book => {
      if (book.tags) {
        try {
          const tags = JSON.parse(book.tags)
          tags.forEach((tag: string) => tagSet.add(tag))
        } catch (e) {
          // Ignore invalid JSON
        }
      }
    })
    setAllTags(Array.from(tagSet).sort())
  }

  const fetchBooks = async (search?: string, status?: string, tag?: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      if (tag) params.append('tag', tag)
      
      const url = `/api/books${params.toString() ? '?' + params.toString() : ''}`
      console.log('Fetching from URL:', url)
      const response = await fetch(url)
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      // Check if the response is an error
      if (!response.ok || data.error) {
        const errorMessage = data.error || 'Failed to fetch books'
        console.error('Failed to fetch books:', errorMessage, 'Status:', response.status)
        setError(`${errorMessage} (Status: ${response.status})`)
        setBooks([])
        setStats({ total: 0, read: 0, reading: 0, unread: 0 })
        
        // If unauthorized, redirect to login
        if (response.status === 401) {
          router.push('/login')
        }
        return
      }
      
      // Ensure data is an array
      const booksArray = Array.isArray(data) ? data : []
      setBooks(booksArray)
      extractAllTags(booksArray)
      
      // Calculate stats
      const stats = {
        total: booksArray.length,
        read: booksArray.filter((b: Book) => b.status === 'read').length,
        reading: booksArray.filter((b: Book) => b.status === 'reading').length,
        unread: booksArray.filter((b: Book) => b.status === 'unread').length,
      }
      setStats(stats)
    } catch (error) {
      console.error('Failed to fetch books:', error)
      setError('Failed to connect to server')
      setBooks([])
      setStats({ total: 0, read: 0, reading: 0, unread: 0 })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchBooks(searchQuery, filterStatus, filterTag)
  }

  const handleFilterChange = (status: string) => {
    setFilterStatus(status)
    fetchBooks(searchQuery, status, filterTag)
  }

  const handleTagFilterChange = (tag: string) => {
    setFilterTag(tag)
    fetchBooks(searchQuery, filterStatus, tag)
  }

  const toggleBookSelection = (bookId: string) => {
    const newSelected = new Set(selectedBooks)
    if (newSelected.has(bookId)) {
      newSelected.delete(bookId)
    } else {
      newSelected.add(bookId)
    }
    setSelectedBooks(newSelected)
  }

  const selectAllBooks = () => {
    setSelectedBooks(new Set(books.map(book => book.id)))
  }

  const clearSelection = () => {
    setSelectedBooks(new Set())
  }

  const toggleBulkMode = () => {
    setBulkMode(!bulkMode)
    if (bulkMode) {
      clearSelection()
      setShowBulkTagEditor(false)
      setBulkTags([])
    }
  }

  const handleBulkAddTags = async () => {
    if (selectedBooks.size === 0 || bulkTags.length === 0) return

    try {
      const response = await fetch('/api/books/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookIds: Array.from(selectedBooks),
          action: 'addTags',
          tags: bulkTags,
        }),
      })

      if (response.ok) {
        // Refresh the books list
        fetchBooks(searchQuery, filterStatus, filterTag)
        setBulkTags([])
        setShowBulkTagEditor(false)
      }
    } catch (error) {
      console.error('Failed to bulk update tags:', error)
    }
  }

  const sortBooks = (books: Book[]) => {
    return [...books].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return getTitleForSorting(a.title).localeCompare(getTitleForSorting(b.title))
        case 'author':
          return getLastNameForSorting(a.author).localeCompare(getLastNameForSorting(b.author))
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })
  }

  const getLastNameForSorting = (authorName: string) => {
    const parts = authorName.trim().split(/\s+/)
    
    if (parts.length === 1) return parts[0]
    
    // Handle suffixes (Jr., Sr., III, etc.)
    const suffixes = ['Jr.', 'Sr.', 'II', 'III', 'IV', 'Jr', 'Sr']
    let lastName = parts[parts.length - 1]
    
    if (suffixes.includes(lastName) && parts.length > 2) {
      lastName = parts[parts.length - 2]
    }
    
    // Handle prefixes (van, de, von, etc.) - keep them with surname
    const prefixes = ['van', 'de', 'von', 'del', 'da', 'di', 'le', 'la', 'el']
    if (parts.length > 2 && prefixes.includes(parts[parts.length - 2].toLowerCase())) {
      lastName = parts[parts.length - 2] + ' ' + lastName
    }
    
    return lastName
  }

  const getTitleForSorting = (title: string) => {
    // Common articles to ignore (English, Spanish, French, German, Italian)
    const articles = [
      'the', 'a', 'an',           // English
      'el', 'la', 'los', 'las',   // Spanish
      'le', 'la', 'les',          // French
      'der', 'die', 'das',        // German
      'il', 'lo', 'gli', 'le'     // Italian
    ]
    
    const words = title.trim().split(/\s+/)
    
    if (words.length === 1) return title
    
    const firstWord = words[0].toLowerCase()
    
    // If first word is an article, remove it
    if (articles.includes(firstWord)) {
      return words.slice(1).join(' ')
    }
    
    return title
  }

  const groupBooksByLetter = (books: Book[], groupBy: 'title' | 'author' = 'title') => {
    const sorted = sortBooks(books)
    const grouped: { [key: string]: Book[] } = {}
    
    sorted.forEach(book => {
      let text: string
      if (groupBy === 'title') {
        // For title, ignore articles like "The", "A", etc.
        text = getTitleForSorting(book.title)
      } else {
        // For author, use the last name for grouping
        text = getLastNameForSorting(book.author)
      }
      
      const firstLetter = text.charAt(0).toUpperCase()
      const letter = /[A-Z]/.test(firstLetter) ? firstLetter : '#'
      
      if (!grouped[letter]) {
        grouped[letter] = []
      }
      grouped[letter].push(book)
    })
    
    return grouped
  }



  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <h1 className="text-xl md:text-3xl font-bold">The Book Nook</h1>
            </div>
            <div className="flex gap-1 md:gap-2">
              <ThemeToggle />
              <Link href="/add">
                <Button size="sm" className="px-2 md:px-4">
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Add Book</span>
                  <span className="md:hidden">New</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="px-2 md:px-4">
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline md:ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Mobile-friendly stats bar */}
        <div className="flex justify-between items-center bg-muted/50 rounded-lg p-3 mb-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-lg">{stats.total}</div>
            <div className="text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-green-600">{stats.read}</div>
            <div className="text-muted-foreground">Read</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-blue-600">{stats.reading}</div>
            <div className="text-muted-foreground">Reading</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-orange-600">{stats.unread}</div>
            <div className="text-muted-foreground">To Read</div>
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {bulkMode && (
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {selectedBooks.size} book{selectedBooks.size !== 1 ? 's' : ''} selected
                </span>
                <Button variant="outline" size="sm" onClick={selectAllBooks}>
                  Select All ({books.length})
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowBulkTagEditor(!showBulkTagEditor)}
                  disabled={selectedBooks.size === 0}
                >
                  <Tag className="h-4 w-4 mr-1" />
                  Add Tags
                </Button>
                <Button variant="outline" size="sm" onClick={toggleBulkMode}>
                  Exit Bulk Mode
                </Button>
              </div>
            </div>
            {showBulkTagEditor && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Add tags to selected books:</span>
                  <div className="flex-1">
                    <TagInput
                      tags={bulkTags}
                      onChange={setBulkTags}
                      suggestions={allTags}
                      placeholder="Select tags to add..."
                    />
                  </div>
                  <Button 
                    onClick={handleBulkAddTags}
                    disabled={bulkTags.length === 0}
                    size="sm"
                  >
                    Apply Tags
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="space-y-3 mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 h-9"
            />
            <Button onClick={handleSearch} variant="outline" size="sm" className="px-2 md:px-4">
              <Search className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => setShowFilters(!showFilters)} 
              variant="outline" 
              size="sm"
              className="px-2 md:px-4"
            >
              <Filter className="h-4 w-4" />
            </Button>
            {!bulkMode && books.length > 0 && (
              <Button 
                onClick={toggleBulkMode}
                variant="outline" 
                size="sm"
                className="px-2 md:px-4"
              >
                <CheckSquare className="h-4 w-4" />
                <span className="hidden md:inline md:ml-2">Select</span>
              </Button>
            )}
          </div>
          
          {showFilters && (
            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Button
                  variant={filterStatus === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('unread')}
                >
                  To Read
                </Button>
                <Button
                  variant={filterStatus === 'reading' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('reading')}
                >
                  Reading
                </Button>
                <Button
                  variant={filterStatus === 'read' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('read')}
                >
                  Read
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Tag:</span>
                <Button
                  variant={filterTag === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTagFilterChange('')}
                >
                  All
                </Button>
                {allTags.slice(0, 4).map((tag) => (
                  <Button
                    key={tag}
                    variant={filterTag === tag ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTagFilterChange(tag)}
                  >
                    {tag}
                  </Button>
                ))}
                {allTags.length > 4 && (
                  <span className="text-xs text-muted-foreground">
                    +{allTags.length - 4} more
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sort:</span>
                <Button
                  variant={sortBy === 'title' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('title')}
                >
                  Title
                </Button>
                <Button
                  variant={sortBy === 'author' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('author')}
                >
                  Author
                </Button>
                <Button
                  variant={sortBy === 'rating' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('rating')}
                >
                  Rating
                </Button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading your library...
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-destructive/10 text-destructive rounded-lg p-4 max-w-md mx-auto">
              <p className="font-semibold">Error loading books</p>
              <p className="text-sm mt-1">{error}</p>
              <Button 
                onClick={() => fetchBooks()} 
                variant="outline" 
                size="sm"
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No books in your library yet</h2>
            <p className="text-muted-foreground mb-4">Start building your collection by adding your first book</p>
            <Link href="/add">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Book
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex gap-6">
            <div className="flex-1 space-y-6">
              {(sortBy === 'title' || sortBy === 'author') ? (
                // Show alphabetical sections when sorting by title or author
                Object.entries(groupBooksByLetter(books, sortBy as 'title' | 'author'))
                  .sort(([a], [b]) => {
                    if (a === '#') return 1
                    if (b === '#') return -1
                    return a.localeCompare(b)
                  })
                  .map(([letter, booksInSection]) => (
                    <div key={letter} id={`section-${letter}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          {letter}
                        </div>
                        <div className="flex-1 h-px bg-border"></div>
                        <span className="text-sm text-muted-foreground">{booksInSection.length} book{booksInSection.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {booksInSection.map((book) => (
                          <BookCard
                            key={book.id}
                            book={book}
                            isSelected={selectedBooks.has(book.id)}
                            onToggleSelect={toggleBookSelection}
                            bulkMode={bulkMode}
                          />
                        ))}
                      </div>
                    </div>
                  ))
              ) : (
                // Show regular grid for other sorting options (rating, status)
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sortBooks(books).map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      isSelected={selectedBooks.has(book.id)}
                      onToggleSelect={toggleBookSelection}
                      bulkMode={bulkMode}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Letter Navigation Minimap */}
            {(sortBy === 'title' || sortBy === 'author') && books.length > 0 && (
              <div className="hidden lg:block w-12 flex-shrink-0">
                <div className="sticky top-24 bg-background/80 backdrop-blur-sm border rounded-lg p-2">
                  <div className="grid grid-cols-1 gap-1">
                    {Object.keys(groupBooksByLetter(books, sortBy as 'title' | 'author'))
                      .sort((a, b) => {
                        if (a === '#') return 1
                        if (b === '#') return -1
                        return a.localeCompare(b)
                      })
                      .map((letter) => (
                        <button
                          key={letter}
                          onClick={() => {
                            const element = document.getElementById(`section-${letter}`)
                            element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }}
                          className="w-8 h-8 rounded text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
                          title={`Jump to ${letter} section`}
                        >
                          {letter}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
