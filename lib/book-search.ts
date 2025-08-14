import { searchGoogleBooks, parseGoogleBook, GoogleBookVolume } from './google-books';

export interface BookSearchResult {
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publicationYear?: number;
  description?: string;
  pageCount?: number;
  genre?: string;
  coverUrl?: string;
  googleBooksId?: string;
}

export interface VisionBookData {
  title?: string;
  author?: string;
  isbn?: string;
  publisher?: string;
}

export async function searchBooksFromVision(visionData: VisionBookData): Promise<BookSearchResult[]> {
  const searchQueries: string[] = [];
  
  // Build search queries based on available vision data
  if (visionData.isbn) {
    searchQueries.push(`isbn:${visionData.isbn}`);
  }
  
  if (visionData.title && visionData.author) {
    searchQueries.push(`"${visionData.title}" "${visionData.author}"`);
  } else if (visionData.title) {
    searchQueries.push(`"${visionData.title}"`);
  } else if (visionData.author) {
    searchQueries.push(`inauthor:"${visionData.author}"`);
  }

  if (visionData.publisher) {
    searchQueries.push(`inpublisher:"${visionData.publisher}"`);
  }

  // Try each search query until we get results
  for (const query of searchQueries) {
    try {
      const response = await searchGoogleBooks(query);
      if (response.items && response.items.length > 0) {
        return response.items.map((volume: GoogleBookVolume) => ({
          ...parseGoogleBook(volume),
          googleBooksId: volume.id
        }));
      }
    } catch (error) {
      console.error(`Search failed for query "${query}":`, error);
    }
  }

  // If no exact matches found, try broader search
  if (visionData.title) {
    try {
      const broadQuery = visionData.title.split(' ').slice(0, 3).join(' '); // First 3 words
      const response = await searchGoogleBooks(broadQuery);
      if (response.items && response.items.length > 0) {
        return response.items.map((volume: GoogleBookVolume) => ({
          ...parseGoogleBook(volume),
          googleBooksId: volume.id
        }));
      }
    } catch (error) {
      console.error('Broad search failed:', error);
    }
  }

  return [];
}

export function scoreBookMatch(visionData: VisionBookData, bookResult: BookSearchResult): number {
  let score = 0;
  
  // ISBN match is highest priority
  if (visionData.isbn && bookResult.isbn) {
    if (visionData.isbn === bookResult.isbn) return 100;
    // Check if one ISBN is ISBN-10 and other is ISBN-13 version
    const isbn10 = visionData.isbn.replace(/[^0-9X]/gi, '');
    const isbn13 = bookResult.isbn.replace(/[^0-9X]/gi, '');
    if ((isbn10.length === 10 && isbn13.length === 13) || (isbn13.length === 10 && isbn10.length === 13)) {
      score += 90;
    }
  }
  
  // Title similarity
  if (visionData.title && bookResult.title) {
    const visionTitle = visionData.title.toLowerCase().trim();
    const resultTitle = bookResult.title.toLowerCase().trim();
    
    if (visionTitle === resultTitle) {
      score += 40;
    } else if (resultTitle.includes(visionTitle) || visionTitle.includes(resultTitle)) {
      score += 30;
    } else {
      // Calculate word overlap
      const visionWords = visionTitle.split(/\s+/);
      const resultWords = resultTitle.split(/\s+/);
      const commonWords = visionWords.filter(word => 
        word.length > 2 && resultWords.some(rw => rw.includes(word) || word.includes(rw))
      );
      score += Math.min(25, (commonWords.length / Math.max(visionWords.length, resultWords.length)) * 25);
    }
  }
  
  // Author similarity
  if (visionData.author && bookResult.author) {
    const visionAuthor = visionData.author.toLowerCase().trim();
    const resultAuthor = bookResult.author.toLowerCase().trim();
    
    if (visionAuthor === resultAuthor) {
      score += 30;
    } else if (resultAuthor.includes(visionAuthor) || visionAuthor.includes(resultAuthor)) {
      score += 20;
    } else {
      // Check for last name match
      const visionLastName = visionAuthor.split(' ').pop() || '';
      const resultLastName = resultAuthor.split(' ').pop() || '';
      if (visionLastName && resultLastName && visionLastName === resultLastName) {
        score += 15;
      }
    }
  }
  
  // Publisher match
  if (visionData.publisher && bookResult.publisher) {
    const visionPub = visionData.publisher.toLowerCase().trim();
    const resultPub = bookResult.publisher.toLowerCase().trim();
    
    if (visionPub === resultPub || resultPub.includes(visionPub) || visionPub.includes(resultPub)) {
      score += 10;
    }
  }
  
  return score;
}

export function sortBooksByRelevance(visionData: VisionBookData, books: BookSearchResult[]): BookSearchResult[] {
  return books
    .map(book => ({
      ...book,
      _score: scoreBookMatch(visionData, book)
    }))
    .sort((a, b) => (b._score || 0) - (a._score || 0))
    .map(({ _score, ...book }) => book);
}