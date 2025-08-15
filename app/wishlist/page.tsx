'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, LogOut, Search, Filter, Plus, Star, Heart } from 'lucide-react'
import Image from 'next/image'

interface WishlistItem {
  id: string
  title: string
  author: string
  coverUrl?: string | null
  priority: string
  genre?: string | null
  tags?: string | null
  notes?: string | null
  description?: string | null
}

export default function WishlistPage() {
  const router = useRouter()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [allTags, setAllTags] = useState<string[]>([])
  const [filterTag, setFilterTag] = useState('')

  useEffect(() => {
    fetchWishlist()
  }, [])

  const extractAllTags = (items: WishlistItem[]) => {
    const tagSet = new Set<string>()
    items.forEach(item => {
      if (item.tags) {
        try {
          const tags = JSON.parse(item.tags)
          tags.forEach((tag: string) => tagSet.add(tag))
        } catch (e) {
          // Ignore invalid JSON
        }
      }
    })
    setAllTags(Array.from(tagSet).sort())
  }

  const fetchWishlist = async (search?: string, priority?: string, tag?: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (priority) params.append('priority', priority)
      if (tag) params.append('tag', tag)
      
      const url = `/api/wishlist${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url)
      const data = await response.json()
      
      if (!response.ok || data.error) {
        const errorMessage = data.error || 'Failed to fetch wishlist'
        setError(`${errorMessage} (Status: ${response.status})`)
        setWishlistItems([])
        
        if (response.status === 401) {
          router.push('/login')
        }
        return
      }
      
      const itemsArray = Array.isArray(data) ? data : []
      setWishlistItems(itemsArray)
      extractAllTags(itemsArray)
    } catch (error) {
      console.error('Failed to fetch wishlist:', error)
      setError('Failed to connect to server')
      setWishlistItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchWishlist(searchQuery, filterPriority, filterTag)
  }

  const handlePriorityFilterChange = (priority: string) => {
    setFilterPriority(priority)
    fetchWishlist(searchQuery, priority, filterTag)
  }

  const handleTagFilterChange = (tag: string) => {
    setFilterTag(tag)
    fetchWishlist(searchQuery, filterPriority, tag)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }



  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getTagColor = (tag: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    ]
    
    let hash = 0
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const parseTags = (tagsString: string | null | undefined): string[] => {
    if (!tagsString) return []
    try {
      return JSON.parse(tagsString)
    } catch {
      return []
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/wishlist" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Heart className="h-6 w-6 md:h-8 md:w-8 text-rose-600" />
              <h1 className="text-xl md:text-3xl font-bold">My Wishlist</h1>
            </Link>
            <div className="flex gap-1 md:gap-2">
              <ThemeToggle />
              <Link href="/">
                <Button size="sm" variant="outline" className="px-2 md:px-4">
                  <BookOpen className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Library</span>
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
        {/* Stats */}
        <div className="flex justify-between items-center bg-muted/50 rounded-lg p-3 mb-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-lg">{wishlistItems.length}</div>
            <div className="text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-red-600">
              {wishlistItems.filter(item => item.priority === 'high').length}
            </div>
            <div className="text-muted-foreground">High Priority</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-yellow-600">
              {wishlistItems.filter(item => item.priority === 'medium').length}
            </div>
            <div className="text-muted-foreground">Medium</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-green-600">
              {wishlistItems.filter(item => item.priority === 'low').length}
            </div>
            <div className="text-muted-foreground">Low Priority</div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-3 mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="Search wishlist..."
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
          </div>
          
          {showFilters && (
            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Priority:</span>
                <Button
                  variant={filterPriority === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePriorityFilterChange('')}
                >
                  All
                </Button>
                <Button
                  variant={filterPriority === 'high' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePriorityFilterChange('high')}
                >
                  High
                </Button>
                <Button
                  variant={filterPriority === 'medium' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePriorityFilterChange('medium')}
                >
                  Medium
                </Button>
                <Button
                  variant={filterPriority === 'low' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePriorityFilterChange('low')}
                >
                  Low
                </Button>
              </div>
              {allTags.length > 0 && (
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
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading your wishlist...
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-destructive/10 text-destructive rounded-lg p-4 max-w-md mx-auto">
              <p className="font-semibold">Error loading wishlist</p>
              <p className="text-sm mt-1">{error}</p>
              <Button 
                onClick={() => fetchWishlist()} 
                variant="outline" 
                size="sm"
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-4">Start adding books you want to read or buy</p>
            <Link href="/add">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Wishlist Item
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlistItems.map((item) => (
              <Link key={item.id} href={`/wishlist/${item.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer h-32 md:h-36 border-l-4 border-l-rose-500">
                  <CardContent className="p-3 md:p-4 h-full">
                    <div className="flex gap-2 md:gap-3 h-full">
                      <div className="w-12 h-18 md:w-16 md:h-24 relative bg-gray-100 dark:bg-gray-800 rounded flex-shrink-0">
                        {item.coverUrl ? (
                          <Image
                            src={item.coverUrl}
                            alt={item.title}
                            fill
                            className="object-cover rounded"
                            sizes="(max-width: 768px) 48px, 64px"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                            <div className="text-center p-1">
                              <p className="text-xs font-semibold line-clamp-2">{item.title}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between overflow-hidden">
                        <div className="overflow-hidden">
                          <h3 className="font-semibold text-sm md:text-base line-clamp-2 leading-tight">{item.title}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 mt-0.5">{item.author}</p>
                          {item.genre && (
                            <p className="text-xs text-muted-foreground line-clamp-1 hidden md:block mt-0.5">{item.genre}</p>
                          )}
                          {parseTags(item.tags).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {parseTags(item.tags).slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getTagColor(tag)}`}
                                >
                                  {tag}
                                </span>
                              ))}
                              {parseTags(item.tags).length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{parseTags(item.tags).length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-pink-500" />
                            <span className="text-xs text-muted-foreground">Wishlist</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      
      {/* Floating Action Button */}
      <Link href="/add">
        <Button 
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50 bg-blue-500 hover:bg-blue-600 border-0 p-0 flex items-center justify-center"
        >
          <Plus className="h-6 w-6 text-black" />
        </Button>
      </Link>
    </div>
  )
}