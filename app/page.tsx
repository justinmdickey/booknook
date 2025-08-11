'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookCard } from '@/components/book-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { Plus, Search, BookOpen, LogOut, Filter } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  coverUrl?: string | null
  status: string
  rating?: number | null
  genre?: string | null
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
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async (search?: string, status?: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      
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
    fetchBooks(searchQuery, filterStatus)
  }

  const handleFilterChange = (status: string) => {
    setFilterStatus(status)
    fetchBooks(searchQuery, status)
  }

  const sortBooks = (books: Book[]) => {
    return [...books].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'author':
          return a.author.localeCompare(b.author)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })
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

        {/* Search and Filter Controls */}
        <div className="space-y-3 mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} variant="outline" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => setShowFilters(!showFilters)} 
              variant="outline" 
              size="sm"
              className="px-2"
            >
              <Filter className="h-4 w-4" />
            </Button>
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
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortBooks(books).map((book) => (
              <BookCard
                key={book.id}
                book={book}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
