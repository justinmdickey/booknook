'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Check } from 'lucide-react'

interface BookCardProps {
  book: {
    id: string
    title: string
    author: string
    coverUrl?: string | null
    status: string
    rating?: number | null
    genre?: string | null
    tags?: string | null
  }
  isSelected?: boolean
  onToggleSelect?: (bookId: string) => void
  bulkMode?: boolean
}

export function BookCard({ book, isSelected = false, onToggleSelect, bulkMode = false }: BookCardProps) {
  const [imageError, setImageError] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'reading':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
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

  const handleCardClick = (e: React.MouseEvent) => {
    if (bulkMode && onToggleSelect) {
      e.preventDefault()
      onToggleSelect(book.id)
    }
  }

  return (
    <div className="relative">
      {bulkMode && (
        <div className="absolute top-2 left-2 z-10">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleSelect?.(book.id)
            }}
            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
              isSelected 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'bg-background border-border hover:border-primary'
            }`}
          >
            {isSelected && <Check className="h-4 w-4" />}
          </button>
        </div>
      )}
      <Link href={bulkMode ? '#' : `/books/${book.id}`} onClick={handleCardClick}>
        <Card className={`overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer h-32 md:h-36 ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}>
          <CardContent className="p-3 md:p-4 h-full">
        <div className="flex gap-2 md:gap-3 h-full">
          <div className="w-12 h-18 md:w-16 md:h-24 relative bg-gray-100 dark:bg-gray-800 rounded flex-shrink-0">
            {book.coverUrl && !imageError ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                className="object-cover rounded"
                sizes="(max-width: 768px) 48px, 64px"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <div className="text-center p-1">
                  <p className="text-xs font-semibold line-clamp-2">{book.title}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between overflow-hidden">
            <div className="overflow-hidden">
              <h3 className="font-semibold text-sm md:text-base line-clamp-2 leading-tight">{book.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 mt-0.5">{book.author}</p>
              {book.genre && (
                <p className="text-xs text-muted-foreground line-clamp-1 hidden md:block mt-0.5">{book.genre}</p>
              )}
              {parseTags(book.tags).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {parseTags(book.tags).slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getTagColor(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                  {parseTags(book.tags).length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{parseTags(book.tags).length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 md:gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(book.status)}`}>
                {book.status}
              </span>
              {book.rating && (
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-2 w-2 md:h-2.5 md:w-2.5 ${
                      book.rating && i < book.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </CardContent>
      </Card>
    </Link>
    </div>
  )
}