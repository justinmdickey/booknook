'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BookCamera from '@/components/book-camera';
import { searchBooksFromVision, sortBooksByRelevance } from '@/lib/book-search';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDestination?: 'library' | 'wishlist';
}

export default function AddBookModal({ isOpen, onClose, defaultDestination = 'library' }: AddBookModalProps) {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessingVision, setIsProcessingVision] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [visionResults, setVisionResults] = useState<any[]>([]);
  const [showVisionResults, setShowVisionResults] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkOllamaAvailability();
    }
  }, [isOpen]);

  const checkOllamaAvailability = async () => {
    try {
      const response = await fetch('/api/ollama');
      const data = await response.json();
      setOllamaAvailable(data.available);
      setAvailableModels(data.models || []);
    } catch (error) {
      console.error('Failed to check Ollama availability:', error);
      setOllamaAvailable(false);
    }
  };

  const handleSearchOption = () => {
    onClose();
    router.push('/add');
  };

  const handleScanOption = () => {
    if (ollamaAvailable && availableModels.length > 0) {
      setShowCamera(true);
    } else {
      alert('Vision scanning is not available. Please ensure Ollama is running with a vision model.');
    }
  };

  const handleVisionCapture = async (imageBase64: string, selectedModel: string) => {
    setIsProcessingVision(true);
    
    try {
      const formData = new FormData();
      const imageBlob = new Blob([
        Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0))
      ], { type: 'image/jpeg' });
      
      formData.append('image', imageBlob);
      formData.append('model', selectedModel);
      
      const response = await fetch('/api/books/scan', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const searchResults = await searchBooksFromVision(result.data);
        const sortedResults = sortBooksByRelevance(result.data, searchResults);
        setVisionResults(sortedResults);
        setShowCamera(false);
        setShowVisionResults(true);
      } else {
        alert(result.error || 'Failed to analyze image');
      }
    } catch (error) {
      console.error('Vision processing failed:', error);
      alert('Failed to process image');
    } finally {
      setIsProcessingVision(false);
    }
  };

  const handleAddBook = async (book: any) => {
    try {
      const endpoint = defaultDestination === 'wishlist' ? '/api/wishlist' : '/api/books';
      const payload = defaultDestination === 'wishlist' 
        ? { ...book, priority: 'medium' }
        : { ...book, status: 'unread' };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        onClose();
        setShowVisionResults(false);
        setVisionResults([]);
        // Refresh the current page
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to add book:', error);
    }
  };

  const handleAddToLibrary = (book: any) => {
    handleAddBook({ ...book, status: 'unread' });
  };

  const handleAddToWishlist = (book: any) => {
    handleAddBook({ ...book, priority: 'medium' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Add a Book</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {showVisionResults && visionResults.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Books Found from Image</h3>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {visionResults.map((book, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex gap-3">
                      {book.coverUrl && (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{book.title}</h4>
                        <p className="text-sm text-muted-foreground">by {book.author}</p>
                        {book.publisher && (
                          <p className="text-xs text-muted-foreground">
                            {book.publisher}{book.publicationYear && `, ${book.publicationYear}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => handleAddToLibrary(book)}
                        className="flex-1"
                      >
                        Add to Library
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddToWishlist(book)}
                        className="flex-1"
                      >
                        Add to Wishlist
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowVisionResults(false);
                  setVisionResults([]);
                }}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                How would you like to add a book?
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleSearchOption}
                  className="w-full justify-start h-12"
                  variant="outline"
                >
                  <Search className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Search for Book</div>
                    <div className="text-xs text-muted-foreground">
                      Search by title, author, or ISBN
                    </div>
                  </div>
                </Button>

                {ollamaAvailable && availableModels.length > 0 && (
                  <Button
                    onClick={handleScanOption}
                    className="w-full justify-start h-12"
                    variant="outline"
                  >
                    <Camera className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Scan Book Cover</div>
                      <div className="text-xs text-muted-foreground">
                        Take a photo of the book
                      </div>
                    </div>
                  </Button>
                )}
              </div>

              {(!ollamaAvailable || availableModels.length === 0) && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Scan feature requires Ollama with a vision model
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {showCamera && (
        <BookCamera
          onImageCapture={handleVisionCapture}
          isProcessing={isProcessingVision}
          availableModels={availableModels}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}