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
import { ArrowLeft, Save, Star, Trash2 } from 'lucide-react'

interface BookDetails {
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
  status: string
  rating?: number | null
  personalNotes?: string | null
  tags?: string | null
}

export default function BookDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [book, setBook] = useState<BookDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<BookDetails | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    const loadBook = async () => {
      const { id } = await params
      fetchBook(id)
      fetchAllTags()
    }
    loadBook()
  }, [])

  const fetchAllTags = async () => {
    try {
      const response = await fetch('/api/books')
      const books = await response.json()
      const tagSet = new Set<string>()
      
      books.forEach((book: any) => {
        if (book.tags) {
          try {
            const tags = JSON.parse(book.tags)
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

  const fetchBook = async (id: string) => {
    try {
      const response = await fetch(`/api/books/${id}`)
      const data = await response.json()
      setBook(data)
      setFormData(data)
    } catch (error) {
      console.error('Failed to fetch book:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData) return
    const { id } = await params

    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        const updatedBook = await response.json()
        setBook(updatedBook)
        setEditing(false)
      }
    } catch (error) {
      console.error('Failed to update book:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this book?')) return
    const { id } = await params

    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to delete book:', error)
    }
  }

  const handleRatingChange = (newRating: number) => {
    if (formData) {
      setFormData({ ...formData, rating: newRating })
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading book details...</p>
      </div>
    )
  }

  if (!book || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Book not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Book Details</h1>
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              {!editing ? (
                <>
                  <Button size="sm" onClick={() => setEditing(true)} className="px-2 md:px-4">Edit</Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete} className="px-2 md:px-4">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => {
                    setEditing(false)
                    setFormData(book)
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
                {book.coverUrl ? (
                  <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                    <Image
                      src={book.coverUrl}
                      alt={book.title}
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
                      <label className="text-sm font-medium">Status</label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="unread">Unread</option>
                        <option value="reading">Currently Reading</option>
                        <option value="read">Read</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Rating</label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                formData.rating && star <= formData.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tags</label>
                      <TagInput
                        tags={parseTags(formData.tags)}
                        onChange={handleTagsChange}
                        suggestions={allTags}
                        placeholder="Add tags like 'Kids Books', 'Favorites', etc."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Personal Notes</label>
                      <textarea
                        className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.personalNotes || ''}
                        onChange={(e) => setFormData({ ...formData, personalNotes: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h2 className="text-3xl font-bold">{book.title}</h2>
                      <p className="text-xl text-muted-foreground mt-1">{book.author}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        book.status === 'read' ? 'bg-green-100 text-green-800' :
                        book.status === 'reading' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {book.status === 'read' ? 'Read' :
                         book.status === 'reading' ? 'Currently Reading' : 'Unread'}
                      </span>
                      
                      {book.rating && (
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                book.rating && i < book.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid gap-2 text-sm">
                      {book.genre && (
                        <div>
                          <span className="font-medium">Genre:</span> {book.genre}
                        </div>
                      )}
                      {book.publisher && (
                        <div>
                          <span className="font-medium">Publisher:</span> {book.publisher}
                        </div>
                      )}
                      {book.publicationYear && (
                        <div>
                          <span className="font-medium">Year:</span> {book.publicationYear}
                        </div>
                      )}
                      {book.isbn && (
                        <div>
                          <span className="font-medium">ISBN:</span> {book.isbn}
                        </div>
                      )}
                      {book.pageCount && (
                        <div>
                          <span className="font-medium">Pages:</span> {book.pageCount}
                        </div>
                      )}
                    </div>
                    
                    {book.description && (
                      <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-sm text-muted-foreground">{book.description}</p>
                      </div>
                    )}
                    
                    {parseTags(book.tags).length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {parseTags(book.tags).map((tag) => (
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
                    
                    {book.personalNotes && (
                      <div>
                        <h3 className="font-semibold mb-2">Personal Notes</h3>
                        <p className="text-sm">{book.personalNotes}</p>
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