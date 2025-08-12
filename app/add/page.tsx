'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookSearch } from '@/components/book-search'
import { TagInput } from '@/components/tag-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'

export default function AddBook() {
  const router = useRouter()
  const [manualEntry, setManualEntry] = useState(false)
  const [allTags, setAllTags] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationYear: '',
    genre: '',
    description: '',
    pageCount: '',
    coverUrl: '',
    tags: [] as string[],
  })

  useEffect(() => {
    fetchAllTags()
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

  const handleAddFromSearch = async (book: any) => {
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...book,
          status: 'unread',
        }),
      })
      
      if (response.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to add book:', error)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          publicationYear: formData.publicationYear ? parseInt(formData.publicationYear) : undefined,
          pageCount: formData.pageCount ? parseInt(formData.pageCount) : undefined,
          tags: JSON.stringify(formData.tags),
          status: 'unread',
        }),
      })
      
      if (response.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to add book:', error)
    }
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
              <h1 className="text-2xl font-bold">Add New Book</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search for a Book</CardTitle>
            </CardHeader>
            <CardContent>
              <BookSearch onAddBook={handleAddFromSearch} />
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => setManualEntry(!manualEntry)}
            >
              {manualEntry ? 'Hide Manual Entry' : 'Or Enter Book Details Manually'}
            </Button>
          </div>

          {manualEntry && (
            <Card>
              <CardHeader>
                <CardTitle>Manual Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Title *</label>
                      <Input
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Author *</label>
                      <Input
                        required
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">ISBN</label>
                      <Input
                        value={formData.isbn}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Publisher</label>
                      <Input
                        value={formData.publisher}
                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Publication Year</label>
                      <Input
                        type="number"
                        value={formData.publicationYear}
                        onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Genre</label>
                      <Input
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Page Count</label>
                      <Input
                        type="number"
                        value={formData.pageCount}
                        onChange={(e) => setFormData({ ...formData, pageCount: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Cover Image URL</label>
                      <Input
                        type="url"
                        value={formData.coverUrl}
                        onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Tags</label>
                    <TagInput
                      tags={formData.tags}
                      onChange={(tags) => setFormData({ ...formData, tags })}
                      suggestions={allTags}
                      placeholder="Add tags like 'Kids Books', 'Favorites', etc."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Add Book
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}