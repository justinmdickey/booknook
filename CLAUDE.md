# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `npm run dev` - Start development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with default user

### Database Operations
- `npx prisma migrate dev` - Run database migrations in development
- `npx prisma db push` - Push schema changes to database
- `npx prisma studio` - Open Prisma Studio database browser
- `npx prisma generate` - Generate Prisma client after schema changes

### Docker Operations
- `docker-compose up -d` - Start application in Docker
- `docker-compose down` - Stop Docker containers
- `docker-compose logs -f` - View container logs
- `docker-compose up -d --build` - Rebuild and start containers

### Ollama Vision Integration
- `ollama serve` - Start Ollama server (required for vision features)
- Install vision models: `ollama pull llava` or `ollama pull bakllava`
- Configure via environment variables in `.env`

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens with bcryptjs for password hashing
- **UI Components**: Custom components built with Radix UI primitives
- **External APIs**: Google Books API for book metadata
- **Vision AI**: Ollama integration for book recognition from photos

### Database Schema
The app uses three main models:
- **User**: Authentication and user management
- **Book**: Personal library with reading status, ratings, tags, and notes
- **WishlistItem**: Books user wants to read with priority levels

### Key Architecture Patterns

#### Authentication Flow
- JWT tokens stored in HTTP-only cookies via `cookies-next`
- Middleware (`middleware.ts`) handles route protection
- Auth utilities in `lib/auth.ts` handle token generation/verification
- Default admin user created automatically on first run

#### Data Layer
- Prisma client singleton pattern in `lib/db.ts`
- All database operations use the shared Prisma instance
- SQLite database file stored at `prisma/dev.db`

#### API Routes Structure
- `/api/auth/*` - Authentication endpoints (login, logout, setup)
- `/api/books/*` - Book management (CRUD, search, bulk operations)
- `/api/books/scan` - Vision-based book recognition from photos
- `/api/wishlist/*` - Wishlist management
- `/api/ollama` - Ollama service status and model listing

#### Component Architecture
- UI components in `components/ui/` follow Radix UI patterns
- Feature components in `components/` (book-card, book-search, etc.)
- Theme system using CSS variables and dark mode support
- Responsive design with mobile-first approach

### Important Implementation Details

#### Tags System
- Tags stored as JSON string in database (`tags` field)
- Bulk tag editing functionality available
- Tag filtering and search capabilities

#### Book Status Management
- Three states: "unread", "reading", "read"
- Rating system (1-5 stars)
- Personal notes and publication metadata

#### Google Books Integration
- Book search and metadata import via `lib/google-books.ts`
- Cover images served from Google Books API
- Automatic ISBN, author, publisher population

#### Ollama Vision Integration
- Vision model integration via `lib/ollama.ts`
- Camera capture and file upload support in `components/book-camera.tsx`
- Intelligent book search using extracted text from photos
- Support for multiple vision models (llava, bakllava, etc.)
- Book matching algorithm with relevance scoring

#### Security Considerations
- Environment variables for JWT secrets and default credentials
- Password hashing with bcryptjs (10 rounds)
- Route protection via Next.js middleware
- Default credentials should be changed in production

### Development Workflow
1. Copy `.env.example` to `.env` and configure
2. Run `npm install` to install dependencies
3. Run `npx prisma migrate dev` to set up database
4. Run `npm run seed` to create default user
5. (Optional) Start Ollama server and install vision models for photo scanning
6. Run `npm run dev` to start development server

Default login credentials: admin/changeme (change in production)