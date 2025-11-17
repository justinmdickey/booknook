# CLAUDE.md - AI Assistant Guide for The Book Nook

> **Last Updated**: 2025-11-17
> **Purpose**: Comprehensive guide for AI assistants working on The Book Nook codebase

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Reference](#quick-reference)
3. [Architecture & Tech Stack](#architecture--tech-stack)
4. [Codebase Structure](#codebase-structure)
5. [Development Workflows](#development-workflows)
6. [Key Conventions](#key-conventions)
7. [Authentication System](#authentication-system)
8. [Database Schema](#database-schema)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [Component Guidelines](#component-guidelines)
11. [Common Tasks](#common-tasks)
12. [Testing & Debugging](#testing--debugging)
13. [Deployment](#deployment)

---

## Project Overview

**The Book Nook** is a full-stack personal library management application built with Next.js 15, TypeScript, and SQLite. It enables users to catalog books, maintain wishlists, and integrate with Google Books API for enriched metadata.

### Key Features
- User authentication (JWT-based)
- Book cataloging with ratings, notes, and tags
- Wishlist management with priority levels
- Google Books API integration
- Dark/light theme support
- Docker deployment ready
- PWA capabilities

### Stats
- **Language**: TypeScript
- **Total TS Files**: 19 files (~1,523 LOC)
- **Database**: SQLite with Prisma ORM
- **Deployment**: Docker via GitHub Actions

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev                    # Start dev server with Turbopack
npm run build                  # Production build
npm run start                  # Start production server
npm run lint                   # Run ESLint

# Database
npx prisma migrate dev         # Run migrations (development)
npx prisma migrate deploy      # Run migrations (production)
npm run seed                   # Seed database with default user
npx prisma studio              # Open Prisma Studio GUI

# Docker
docker-compose up -d           # Start application
docker-compose logs -f         # View logs
docker-compose down            # Stop application
docker-compose down -v         # Stop and remove volumes (reset DB)
```

### Important File Locations

| Purpose | Path |
|---------|------|
| API Routes | `app/api/` |
| Pages | `app/` |
| Components | `components/` |
| Utilities | `lib/` |
| Database Schema | `prisma/schema.prisma` |
| Auth Logic | `lib/auth.ts` |
| Middleware | `middleware.ts` |
| Config | `next.config.ts`, `tailwind.config.ts` |

### Environment Variables

```bash
DEFAULT_USERNAME=admin              # Initial admin username
DEFAULT_PASSWORD=your-password      # Initial admin password (change in production!)
JWT_SECRET=your-secret-key          # JWT signing secret (required)
DATABASE_URL=file:./dev.db          # SQLite database path
```

---

## Architecture & Tech Stack

### Core Technologies

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 3.4, Radix UI primitives
- **Database**: SQLite + Prisma ORM 6.13
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **API**: REST endpoints via Next.js API Routes
- **Deployment**: Docker + GitHub Actions CI/CD

### Architecture Pattern

**Monolithic Full-Stack Application**
- Single Next.js codebase for frontend and backend
- App Router with Server Components (RSC)
- API Routes for REST endpoints
- Edge Middleware for authentication
- SQLite database (no external DB service needed)

### Data Flow

```
Client (Browser)
  ↓ HTTP Request
Next.js Middleware (Auth Check)
  ↓ Authenticated
API Route Handler
  ↓ Verify JWT
Prisma ORM
  ↓ SQL Query
SQLite Database
  ↓ Response
API Route → JSON → Client
```

---

## Codebase Structure

```
/home/user/booknook/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/route.ts    # POST login
│   │   │   ├── logout/route.ts   # POST logout
│   │   │   ├── setup/route.ts    # GET setup default user
│   │   │   └── clear/route.ts    # POST clear cookies (debug)
│   │   ├── books/                # Book management
│   │   │   ├── route.ts          # GET/POST books
│   │   │   ├── [id]/route.ts     # GET/PUT/DELETE single book
│   │   │   ├── search/route.ts   # GET Google Books search
│   │   │   └── bulk-update/route.ts # POST bulk tag operations
│   │   ├── wishlist/             # Wishlist management
│   │   │   ├── route.ts          # GET/POST wishlist
│   │   │   └── [id]/route.ts     # GET/PUT/DELETE wishlist item
│   │   └── test/route.ts         # GET auth status check
│   ├── add/page.tsx              # Add book page
│   ├── books/[id]/page.tsx       # Book detail page
│   ├── wishlist/                 # Wishlist pages
│   │   ├── page.tsx              # Wishlist listing
│   │   └── [id]/page.tsx         # Wishlist item detail
│   ├── debug/page.tsx            # Debug utilities
│   ├── login/page.tsx            # Login page
│   ├── page.tsx                  # Home (library view)
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global Tailwind styles
├── components/                    # React components
│   ├── ui/                       # Reusable UI (shadcn/ui)
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx              # Card components
│   │   └── input.tsx             # Input component
│   ├── book-card.tsx             # Book display card
│   ├── book-search.tsx           # Google Books search
│   ├── tag-input.tsx             # Tag management
│   ├── theme-provider.tsx        # Theme context
│   └── theme-toggle.tsx          # Theme toggle button
├── lib/                          # Utility libraries
│   ├── auth.ts                   # JWT authentication
│   ├── db.ts                     # Prisma client singleton
│   ├── google-books.ts           # Google Books API
│   └── utils.ts                  # Tailwind utilities (cn)
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Database seeding
│   └── migrations/               # Schema migrations
├── scripts/                      # Helper scripts
│   ├── add-sample-books.js
│   ├── test-api.js
│   └── update-user.js
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   └── [icons]                   # Favicons, PWA icons
├── .github/workflows/
│   └── docker-build.yml          # CI/CD pipeline
├── middleware.ts                 # Next.js auth middleware
├── Dockerfile                    # Production Docker image
├── docker-compose.yml.template   # Docker Compose template
├── next.config.ts                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies & scripts
```

---

## Development Workflows

### Local Development Setup

1. **Clone and install**:
   ```bash
   git clone <repo-url>
   cd booknook
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Initialize database**:
   ```bash
   npx prisma migrate dev    # Run migrations
   npm run seed              # Create default user
   ```

4. **Start development server**:
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

### Git Workflow

- **Main branch**: `master`
- **Development branches**: `claude/*` prefix required for CI/CD
- **Commit messages**: Concise, descriptive (see git log for style)
- **Pre-push**: Ensure build succeeds (`npm run build`)

### GitHub Actions CI/CD

**File**: `.github/workflows/docker-build.yml`

**Triggers**:
- Push to `master` branch
- Version tags (`v*.*.*`)
- Ignores: docs, assets, workflow changes

**Process**:
1. Checkout code
2. Set up Docker Buildx
3. Login to GitHub Container Registry (ghcr.io)
4. Extract metadata for tagging
5. Build multi-stage Docker image
6. Push to `ghcr.io/justinmdickey/booknook`

**Tags created**:
- `latest` (for master branch)
- Semantic versions (e.g., `1.2.3`, `1.2`, `1`)
- Git SHA
- Branch name

### Making Changes

1. **Create feature branch**:
   ```bash
   git checkout -b claude/feature-name
   ```

2. **Make changes** following conventions (see below)

3. **Test locally**:
   ```bash
   npm run dev       # Manual testing
   npm run build     # Ensure build succeeds
   npm run lint      # Check for linting issues
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "Descriptive message"
   git push -u origin claude/feature-name
   ```

5. **Create PR** using `gh pr create` or GitHub UI

---

## Key Conventions

### File Naming

- **Components**: `kebab-case.tsx` (e.g., `book-card.tsx`)
- **Component names**: `PascalCase` (e.g., `BookCard`)
- **Utilities**: `kebab-case.ts` (e.g., `google-books.ts`)
- **API routes**: `route.ts` (Next.js convention)
- **Pages**: `page.tsx` (Next.js convention)

### TypeScript Conventions

#### Client vs Server Components

```typescript
// Client component (needs interactivity)
'use client'

import { useState } from 'react'

export default function MyComponent() {
  const [state, setState] = useState()
  // ...
}

// Server component (default, no directive needed)
import { prisma } from '@/lib/db'

export default async function MyPage() {
  const data = await prisma.book.findMany()
  // ...
}
```

#### Props Typing

Always define explicit interfaces for component props:

```typescript
interface BookCardProps {
  book: {
    id: string
    title: string
    author: string
    // ... other fields
  }
  isSelected?: boolean
  onToggleSelect?: (bookId: string) => void
}

export function BookCard({ book, isSelected, onToggleSelect }: BookCardProps) {
  // ...
}
```

#### Async/Await Pattern

```typescript
// API routes
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const books = await prisma.book.findMany({
      where: { userId: user.userId }
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `bookCount`, `isLoading` |
| Functions | camelCase | `fetchBooks`, `handleClick` |
| Components | PascalCase | `BookCard`, `ThemeProvider` |
| Interfaces | PascalCase | `BookCardProps`, `Book` |
| Constants (env) | UPPER_SNAKE_CASE | `JWT_SECRET` |
| Boolean flags | is/has/show prefix | `isSelected`, `hasError` |
| Event handlers | handle* prefix | `handleSubmit`, `handleSearch` |
| Files | kebab-case | `book-card.tsx`, `auth.ts` |

### Code Style

#### Imports Order

```typescript
// 1. External dependencies
import { useState, useEffect } from 'react'
import { NextRequest, NextResponse } from 'next/server'

// 2. Internal utilities
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// 3. Components
import { Button } from '@/components/ui/button'
import { BookCard } from '@/components/book-card'

// 4. Types
import type { Book } from '@prisma/client'
```

#### Component Structure

```typescript
'use client' // If needed

// Imports
import { useState } from 'react'

// Types
interface Props {
  // ...
}

// Main component
export default function Component({ prop1, prop2 }: Props) {
  // 1. Hooks
  const [state, setState] = useState()

  // 2. Derived state
  const computedValue = useMemo(() => {
    // ...
  }, [dependency])

  // 3. Event handlers
  const handleEvent = () => {
    // ...
  }

  // 4. Effects
  useEffect(() => {
    // ...
  }, [])

  // 5. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### Styling Conventions

**Use Tailwind utility classes** - No custom CSS:

```typescript
// ✅ Good
<div className="flex items-center gap-2 rounded-lg bg-slate-100 p-4">

// ❌ Avoid custom CSS
<div className="custom-card-style">
```

**Use cn() utility for conditional classes**:

```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes",
  className // Allow className override
)}>
```

---

## Authentication System

### Overview

- **Strategy**: JWT tokens stored in HTTP-only cookies
- **Token expiry**: 7 days
- **Password hashing**: bcryptjs (10 salt rounds)
- **Protected routes**: All routes except `/login` and `/api/auth/*`

### Key Functions (`lib/auth.ts`)

```typescript
// Password management
async function hashPassword(password: string): Promise<string>
async function verifyPassword(password: string, hash: string): Promise<boolean>

// JWT management
function generateToken(payload: JWTPayload): string
function verifyToken(token: string): JWTPayload | null

// Request authentication
async function getUserFromRequest(req: NextRequest): Promise<JWTPayload | null>

// Setup
async function createDefaultUser(): Promise<void>
```

### Middleware (`middleware.ts`)

**Location**: Root of project

**Purpose**: Protect all routes except login and auth API

```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isApiAuth = request.nextUrl.pathname.startsWith('/api/auth')

  // Allow login page and auth API
  if (isLoginPage || isApiAuth) {
    // Redirect to home if already logged in
    if (token && isLoginPage) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Require authentication for all other routes
  if (!token) {
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
```

### Using Authentication in API Routes

```typescript
import { getUserFromRequest } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Get authenticated user
  const user = await getUserFromRequest(request)

  // Check authorization
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use user.userId to scope queries
  const books = await prisma.book.findMany({
    where: { userId: user.userId }
  })

  return NextResponse.json(books)
}
```

### Security Features

- **HTTP-only cookies**: Prevents XSS attacks
- **SameSite: lax**: CSRF protection
- **Secure flag**: HTTPS-only in production
- **Password hashing**: Never store plain passwords
- **User-scoped data**: All queries filtered by `userId`

---

## Database Schema

### Models

#### User

```prisma
model User {
  id           String        @id @default(cuid())
  username     String        @unique
  passwordHash String
  createdAt    DateTime      @default(now())
  books        Book[]
  wishlist     WishlistItem[]
}
```

#### Book

```prisma
model Book {
  id              String   @id @default(cuid())
  isbn            String?
  title           String
  author          String
  publisher       String?
  publicationYear Int?
  genre           String?
  description     String?
  coverUrl        String?
  pageCount       Int?
  status          String   @default("unread")  // "unread" | "reading" | "read"
  rating          Int?     // 1-5 stars
  personalNotes   String?
  tags            String?  // JSON array stored as string
  dateAdded       DateTime @default(now())
  dateModified    DateTime @updatedAt
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([title])
  @@index([author])
  @@index([status])
  @@index([userId])
}
```

#### WishlistItem

```prisma
model WishlistItem {
  id              String   @id @default(cuid())
  isbn            String?
  title           String
  author          String
  publisher       String?
  publicationYear Int?
  genre           String?
  description     String?
  coverUrl        String?
  pageCount       Int?
  tags            String?  // JSON array stored as string
  priority        String   @default("medium")  // "low" | "medium" | "high"
  notes           String?  // Why you want this book
  dateAdded       DateTime @default(now())
  dateModified    DateTime @updatedAt
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([title])
  @@index([author])
  @@index([priority])
  @@index([userId])
}
```

### Important Notes

- **Tags storage**: Tags are stored as JSON strings (`JSON.stringify(array)`)
- **Cascade deletes**: Deleting a user removes all their books and wishlist items
- **Default user**: Created on startup via `/api/auth/setup`
- **IDs**: Using cuid() for globally unique IDs

### Working with Tags

```typescript
// Saving tags
const tagsString = JSON.stringify(['fiction', 'sci-fi'])
await prisma.book.create({
  data: {
    title: 'Book Title',
    author: 'Author Name',
    tags: tagsString,
    userId: user.userId
  }
})

// Reading tags
const book = await prisma.book.findUnique({ where: { id } })
const tags = book.tags ? JSON.parse(book.tags) : []
```

### Migrations

```bash
# Development (creates migration files)
npx prisma migrate dev --name description_of_change

# Production (applies migrations)
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client (after schema changes)
npx prisma generate
```

---

## API Endpoints Reference

### Authentication

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/auth/login` | Login with username/password | No |
| POST | `/api/auth/logout` | Logout (clear cookie) | No |
| GET | `/api/auth/setup` | Create default user | No |
| GET | `/api/test` | Check auth status | No |

### Books

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/books` | List all books | Yes |
| POST | `/api/books` | Create new book | Yes |
| GET | `/api/books/[id]` | Get book details | Yes |
| PUT | `/api/books/[id]` | Update book | Yes |
| DELETE | `/api/books/[id]` | Delete book | Yes |
| GET | `/api/books/search` | Search Google Books | No |
| POST | `/api/books/bulk-update` | Bulk tag operations | Yes |

### Wishlist

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/wishlist` | List wishlist items | Yes |
| POST | `/api/wishlist` | Create wishlist item | Yes |
| GET | `/api/wishlist/[id]` | Get wishlist item | Yes |
| PUT | `/api/wishlist/[id]` | Update wishlist item | Yes |
| DELETE | `/api/wishlist/[id]` | Delete wishlist item | Yes |

### Query Parameters

#### GET /api/books
- `search` (string): Search by title, author, or ISBN
- `status` (string): Filter by status (unread/reading/read)
- `genre` (string): Filter by genre
- `tag` (string): Filter by tag

#### GET /api/wishlist
- `search` (string): Search by title or author
- `priority` (string): Filter by priority (low/medium/high)
- `tag` (string): Filter by tag

#### GET /api/books/search
- `q` (string, required): Search query
- `maxResults` (number): Results per page (default: 40)
- `startIndex` (number): Pagination offset (default: 0)

---

## Component Guidelines

### UI Components (`components/ui/`)

Based on **shadcn/ui** - Radix UI primitives with Tailwind styling.

#### Button

```typescript
import { Button } from '@/components/ui/button'

// Variants: default, destructive, outline, secondary, ghost, link
// Sizes: default, sm, lg, icon
<Button variant="default" size="default">Click me</Button>
```

#### Card

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
  <CardFooter>
    Footer
  </CardFooter>
</Card>
```

#### Input

```typescript
import { Input } from '@/components/ui/input'

<Input type="text" placeholder="Enter text" />
```

### Feature Components

#### BookCard (`components/book-card.tsx`)

Displays a book in grid/list views with cover, title, author, rating, and tags.

```typescript
import { BookCard } from '@/components/book-card'

<BookCard
  book={book}
  isSelected={selectedIds.includes(book.id)}
  onToggleSelect={(id) => toggleSelection(id)}
  bulkMode={bulkMode}
/>
```

**Features**:
- Cover image with fallback
- Star rating display
- Color-coded tags (hash-based algorithm)
- Bulk selection checkbox
- Responsive design

#### BookSearch (`components/book-search.tsx`)

Search and import books from Google Books API.

```typescript
import { BookSearch } from '@/components/book-search'

<BookSearch
  onAddBook={(book) => handleAddToLibrary(book)}
  onAddToWishlist={(book) => handleAddToWishlist(book)}
/>
```

**Features**:
- Real-time search
- Pagination (40 results per page)
- Duplicate detection
- Add to library or wishlist

#### TagInput (`components/tag-input.tsx`)

Manage tags with autocomplete.

```typescript
import { TagInput } from '@/components/tag-input'

<TagInput
  tags={tags}
  onChange={(newTags) => setTags(newTags)}
  suggestions={existingTags}
  placeholder="Add tags..."
/>
```

**Features**:
- Tag creation/deletion
- Autocomplete suggestions
- Keyboard navigation
- Color-coded display

#### ThemeProvider & ThemeToggle

Manage dark/light/system themes.

```typescript
// In app/layout.tsx
import { ThemeProvider } from '@/components/theme-provider'

<ThemeProvider>
  {children}
</ThemeProvider>

// In any component
import { ThemeToggle } from '@/components/theme-toggle'

<ThemeToggle />
```

### Creating New Components

1. **Determine type**:
   - UI component → `components/ui/component-name.tsx`
   - Feature component → `components/component-name.tsx`

2. **Follow structure**:
   ```typescript
   'use client' // If interactive

   import { ... } from 'react'
   import { cn } from '@/lib/utils'

   interface ComponentNameProps {
     // Props
   }

   export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
     // Component logic
     return (
       <div className={cn("base-classes")}>
         {/* JSX */}
       </div>
     )
   }
   ```

3. **Export and import**:
   ```typescript
   // Export from component file
   export function MyComponent() { ... }

   // Import in parent
   import { MyComponent } from '@/components/my-component'
   ```

---

## Common Tasks

### Adding a New API Endpoint

1. **Create route file**:
   ```typescript
   // app/api/my-endpoint/route.ts
   import { NextRequest, NextResponse } from 'next/server'
   import { getUserFromRequest } from '@/lib/auth'
   import { prisma } from '@/lib/db'

   export async function GET(request: NextRequest) {
     try {
       const user = await getUserFromRequest(request)
       if (!user) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
       }

       // Your logic here
       const data = await prisma.book.findMany({
         where: { userId: user.userId }
       })

       return NextResponse.json(data)
     } catch (error) {
       console.error('Error:', error)
       return NextResponse.json({ error: 'Internal error' }, { status: 500 })
     }
   }
   ```

2. **Test endpoint**:
   ```bash
   curl http://localhost:3000/api/my-endpoint
   ```

### Adding a New Page

1. **Create page file**:
   ```typescript
   // app/my-page/page.tsx
   export default function MyPage() {
     return (
       <div className="container mx-auto p-4">
         <h1 className="text-2xl font-bold">My Page</h1>
       </div>
     )
   }
   ```

2. **Add navigation** (if needed):
   ```typescript
   // In app/layout.tsx or navigation component
   <Link href="/my-page">My Page</Link>
   ```

### Adding a Database Field

1. **Update Prisma schema**:
   ```prisma
   // prisma/schema.prisma
   model Book {
     // ... existing fields
     newField String?
   }
   ```

2. **Create migration**:
   ```bash
   npx prisma migrate dev --name add_new_field_to_book
   ```

3. **Update TypeScript types** (automatic via Prisma):
   ```bash
   npx prisma generate
   ```

4. **Update API routes and components** to handle new field

### Adding Google Books Search Features

Google Books API integration is in `lib/google-books.ts`.

**Extend search function**:
```typescript
// lib/google-books.ts
export async function searchGoogleBooks(
  query: string,
  options: SearchOptions = {}
): Promise<GoogleBooksResponse> {
  const { maxResults = 40, startIndex = 0 } = options

  const url = new URL('https://www.googleapis.com/books/v1/volumes')
  url.searchParams.append('q', query)
  url.searchParams.append('maxResults', maxResults.toString())
  url.searchParams.append('startIndex', startIndex.toString())
  // Add new parameters here

  const response = await fetch(url.toString())
  return response.json()
}
```

---

## Testing & Debugging

### Manual Testing

1. **Development server**:
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

2. **Test authentication**:
   - Visit `/login`
   - Login with credentials from `.env`
   - Check `/api/test` to verify auth status

3. **Test API endpoints**:
   ```bash
   # Using curl
   curl -X GET http://localhost:3000/api/books \
     -H "Cookie: auth-token=YOUR_TOKEN"

   # Using scripts/test-api.js
   node scripts/test-api.js
   ```

### Debug Tools

#### Debug Page (`app/debug/page.tsx`)

Access at `/debug` to view:
- Authentication status
- Cookie values
- Environment variables (safe ones)
- Database connection status

#### Prisma Studio

Visual database browser:
```bash
npx prisma studio
# Opens at http://localhost:5555
```

#### Browser DevTools

- **Network tab**: Inspect API requests/responses
- **Application tab**: View cookies, localStorage
- **Console**: Check for client-side errors

### Common Issues

#### "Unauthorized" errors
- Check if `auth-token` cookie is set
- Verify JWT_SECRET matches in all environments
- Check token expiration (7 days)

#### Database errors
- Ensure migrations are up to date: `npx prisma migrate dev`
- Check database file permissions
- Verify DATABASE_URL in `.env`

#### Google Books search not working
- Check network connectivity
- Verify response format hasn't changed
- Check browser console for errors

#### Build errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

---

## Deployment

### Docker Deployment (Recommended)

1. **Create docker-compose.yml**:
   ```bash
   cp docker-compose.yml.template docker-compose.yml
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with production credentials
   ```

3. **Start services**:
   ```bash
   docker-compose up -d
   ```

4. **View logs**:
   ```bash
   docker-compose logs -f
   ```

### Docker Image

**Image**: `ghcr.io/justinmdickey/booknook:latest`

**Tags available**:
- `latest` - Latest master build
- `1.2.3` - Semantic versions (if tagged)
- `sha-abc123` - Git commit SHA

**Volume mounts**:
- `/app/data` - SQLite database (persistent)

**Environment variables**:
- `DATABASE_URL` - Default: `file:/app/data/library.db`
- `JWT_SECRET` - **Required**
- `DEFAULT_USERNAME` - Default: `admin`
- `DEFAULT_PASSWORD` - Default: `changeme`

### Production Checklist

- [ ] Change `DEFAULT_PASSWORD` from default
- [ ] Set strong `JWT_SECRET` (random 32+ chars)
- [ ] Configure volume for `/app/data` (database persistence)
- [ ] Set up HTTPS (reverse proxy)
- [ ] Enable automatic restarts (`restart: unless-stopped`)
- [ ] Set up backups for SQLite database
- [ ] Monitor logs for errors
- [ ] Test authentication flow
- [ ] Test book addition and search

### Updating Deployment

```bash
# Pull latest image
docker-compose pull

# Restart services
docker-compose up -d

# Database migrations run automatically on startup
```

### Manual Build

If you need to build locally instead of using pre-built image:

```bash
# Build image
docker build -t booknook:local .

# Update docker-compose.yml
# Change: image: ghcr.io/justinmdickey/booknook:latest
# To: image: booknook:local

# Start
docker-compose up -d
```

---

## Additional Resources

### External Documentation

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Google Books API](https://developers.google.com/books)

### Project Files to Review

- `README.md` - User-facing documentation
- `package.json` - Dependencies and scripts
- `prisma/schema.prisma` - Database schema
- `next.config.ts` - Next.js configuration
- `.env.example` - Environment variables template

### Key Patterns to Understand

1. **Next.js App Router**: File-based routing, RSC vs client components
2. **Prisma ORM**: Schema-first database design, type-safe queries
3. **JWT Authentication**: Token generation, verification, cookie management
4. **Tailwind CSS**: Utility-first styling, dark mode support
5. **Google Books API**: External API integration, response mapping

---

## Notes for AI Assistants

### When Making Changes

1. **Always read files before editing** - Use the Read tool first
2. **Follow existing patterns** - Match the coding style in the codebase
3. **Update related files** - If changing API, update client code too
4. **Test changes** - Verify builds and runs correctly
5. **Consider security** - User data should always be scoped by userId
6. **Preserve data** - Be careful with database migrations and deletions

### Best Practices

- **Use TypeScript strict mode** - No implicit any
- **Validate user input** - Always check API request data
- **Handle errors gracefully** - Try-catch blocks, user-friendly messages
- **Keep components focused** - Single responsibility principle
- **Optimize queries** - Use Prisma includes/selects wisely
- **Document complex logic** - Add comments for non-obvious code
- **Follow REST conventions** - GET for reads, POST for creates, etc.

### Common Pitfalls to Avoid

- **Don't skip authentication checks** - All protected routes must verify user
- **Don't expose sensitive data** - Never send passwordHash to client
- **Don't hardcode values** - Use environment variables
- **Don't modify Prisma schema without migrations** - Always run migrate dev
- **Don't use any type** - Prefer unknown or proper typing
- **Don't ignore TypeScript errors** - Fix them, don't suppress
- **Don't break existing functionality** - Test thoroughly before committing

---

**Last Updated**: 2025-11-17
**Maintained by**: The Book Nook Contributors
**Questions?**: Check README.md or create an issue
