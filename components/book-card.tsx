'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

interface BookCardProps {
  book: {
    id: string
    title: string
    author: string
    coverUrl?: string | null
    status: string
    rating?: number | null
    genre?: string | null
  }
}

export function BookCard({ book }: BookCardProps) {
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

  return (
    <Link href={`/books/${book.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
        <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="w-16 h-24 relative bg-gray-100 dark:bg-gray-800 rounded flex-shrink-0">
            {book.coverUrl && !imageError ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                className="object-cover rounded"
                sizes="64px"
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
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base line-clamp-1">{book.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
            {book.genre && (
              <p className="text-xs text-muted-foreground line-clamp-1">{book.genre}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(book.status)}`}>
                {book.status}
              </span>
              {book.rating && (
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-2.5 w-2.5 ${
                        book.rating && i < book.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </CardContent>
      </Card>
    </Link>
  )
}