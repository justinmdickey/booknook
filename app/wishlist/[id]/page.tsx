'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { TagInput } from '@/components/tag-input'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Save, Trash2, ArrowRight, Heart } from 'lucide-react'

interface WishlistItemDetails {
  id: string
  title: string
  author: string
  isbn?: string | null
  publisher?: string | null
  publicationYear?: number | null
  genre?: string | null
  description?: string | null
  coverUrl?: string | null
  pageCount?: number | null
  priority: string
  notes?: string | null
  tags?: string | null
}

export default function WishlistItemDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [item, setItem] = useState<WishlistItemDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<WishlistItemDetails | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    const loadItem = async () => {
      const { id } = await params
      fetchItem(id)
      fetchAllTags()
    }
    loadItem()
  }, [])

  const fetchAllTags = async () => {
    try {
      const response = await fetch('/api/wishlist')
      const items = await response.json()
      const tagSet = new Set<string>()
      
      items.forEach((item: any) => {
        if (item.tags) {
          try {
            const tags = JSON.parse(item.tags)
            tags.forEach((tag: string) => tagSet.add(tag))
          } catch (e) {
            // Ignore invalid JSON
          }
        }
      })
      
      setAllTags(Array.from(tagSet))
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  const fetchItem = async (id: string) => {
    try {
      const response = await fetch(`/api/wishlist/${id}`)
      const data = await response.json()
      setItem(data)
      setFormData(data)
    } catch (error) {
      console.error('Failed to fetch wishlist item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData) return
    const { id } = await params

    try {
      const response = await fetch(`/api/wishlist/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        const updatedItem = await response.json()
        setItem(updatedItem)
        setEditing(false)
      }
    } catch (error) {
      console.error('Failed to update wishlist item:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this item from your wishlist?')) return
    const { id } = await params

    try {
      const response = await fetch(`/api/wishlist/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        router.push('/wishlist')
      }
    } catch (error) {
      console.error('Failed to delete wishlist item:', error)
    }
  }

  const moveToLibrary = async () => {
    if (!item) return
    
    try {
      // Add to library
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          status: 'unread',
        }),
      })
      
      if (response.ok) {
        // Remove from wishlist
        await fetch(`/api/wishlist/${item.id}`, {
          method: 'DELETE',
        })
        
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to move to library:', error)
    }
  }

  const parseTags = (tagsString: string | null | undefined): string[] => {
    if (!tagsString) return []
    try {
      return JSON.parse(tagsString)
    } catch {
      return []
    }
  }

  const handleTagsChange = (newTags: string[]) => {
    if (formData) {
      setFormData({ ...formData, tags: JSON.stringify(newTags) })
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading wishlist item...</p>
      </div>
    )
  }

  if (!item || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Wishlist item not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/wishlist">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-pink-600" />
                <h1 className="text-2xl font-bold">Wishlist Item</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              {!editing ? (
                <>
                  <Button size="sm" onClick={() => setEditing(true)} className="px-2 md:px-4">Edit</Button>
                  <Button size="sm" onClick={moveToLibrary} className="px-2 md:px-4">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Move to Library
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete} className="px-2 md:px-4">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => {
                    setEditing(false)
                    setFormData(item)
                  }} className="px-2 md:px-4">
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} className="px-2 md:px-4">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-[150px_1fr]">
              <div>
                {item.coverUrl ? (
                  <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                    <Image
                      src={item.coverUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  </div>
                ) : (
                  <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                    <p className="text-muted-foreground text-center p-4 text-sm">No cover</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {editing ? (
                  <>
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Author</label>
                      <Input
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tags</label>
                      <TagInput
                        tags={parseTags(formData.tags)}
                        onChange={handleTagsChange}
                        suggestions={allTags}
                        placeholder="Add tags like 'Must Read', 'Gift Ideas', etc."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Notes</label>
                      <textarea
                        className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Why do you want this book?"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h2 className="text-3xl font-bold">{item.title}</h2>
                      <p className="text-xl text-muted-foreground mt-1">{item.author}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                      </span>
                    </div>
                    
                    <div className="grid gap-2 text-sm">
                      {item.genre && (
                        <div>
                          <span className="font-medium">Genre:</span> {item.genre}
                        </div>
                      )}
                      {item.publisher && (
                        <div>
                          <span className="font-medium">Publisher:</span> {item.publisher}
                        </div>
                      )}
                      {item.publicationYear && (
                        <div>
                          <span className="font-medium">Year:</span> {item.publicationYear}
                        </div>
                      )}
                      {item.isbn && (
                        <div>
                          <span className="font-medium">ISBN:</span> {item.isbn}
                        </div>
                      )}
                      {item.pageCount && (
                        <div>
                          <span className="font-medium">Pages:</span> {item.pageCount}
                        </div>
                      )}
                    </div>
                    
                    {item.description && (
                      <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    )}
                    
                    {parseTags(item.tags).length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {parseTags(item.tags).map((tag) => (
                            <span
                              key={tag}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {item.notes && (
                      <div>
                        <h3 className="font-semibold mb-2">Notes</h3>
                        <p className="text-sm">{item.notes}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}