'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  useEffect(() => {
    const loadBook = async () => {
      const { id } = await params
      fetchBook(id)
    }
    loadBook()
  }, [])

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
                  <Button onClick={() => setEditing(true)}>Edit</Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => {
                    setEditing(false)
                    setFormData(book)
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
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