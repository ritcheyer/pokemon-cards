# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
A Next.js 15.5.4 web application for managing Pokemon card collections using TypeScript, Tailwind CSS v4, and Supabase as the database. The app supports multiple users with separate collections and integrates with the Pokemon TCG API for card data.

## Development Commands

### Core Development
```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack  
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

### Environment Setup
The project requires these environment variables in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_POKEMON_TCG_API_KEY=your_pokemon_tcg_api_key
```

### Database Setup
Execute the SQL schema in Supabase:
```bash
# The schema is provided in supabase-schema.sql
# Run this in Supabase Dashboard → SQL Editor
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.5.4 with App Router and Turbopack
- **Language**: TypeScript 5 with strict mode
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **External API**: Pokemon TCG API (https://api.pokemontcg.io/v2)
- **Styling**: Tailwind CSS v4
- **Fonts**: Geist Sans and Geist Mono

### Data Flow Architecture
The application uses a **hybrid offline-first approach** with three data layers:

1. **Pokemon TCG API** → Card metadata and images
2. **Supabase Database** → User collections and profiles  
3. **localStorage Cache** → Offline support and performance

**Key Pattern**: Optimistic updates with automatic sync fallback. All mutations update localStorage immediately, then sync to Supabase when online.

### Core Data Models

#### User (Simple profiles, no authentication yet)
```typescript
interface User {
  id: string;
  name: string;
  createdAt: string;
  avatar?: string;
}
```

#### CollectionCard (User's owned cards)
```typescript
interface CollectionCard {
  id: string;
  userId: string;
  cardId: string; // Pokemon TCG API ID
  quantity: number;
  condition: 'mint' | 'near-mint' | 'excellent' | 'good' | 'played' | 'poor';
  addedAt: string;
  updatedAt: string;
  notes?: string;
}
```

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with fonts
│   └── page.tsx           # User selection + collection view
├── lib/
│   ├── api/
│   │   └── pokemon-tcg.ts # Pokemon TCG API client with caching
│   ├── db/
│   │   ├── supabase.ts    # Supabase client configuration
│   │   └── sync.ts        # Offline-first sync layer
│   ├── storage/
│   │   └── localStorage.ts # Cache management utilities
│   ├── types.ts           # TypeScript interfaces
│   └── utils.ts           # Helper functions
```

### Sync System Design
The sync layer (`src/lib/db/sync.ts`) implements:
- **Optimistic Updates**: UI updates immediately, syncs in background
- **Offline Queue**: Changes stored locally when offline, synced when reconnected
- **Cache-First**: Always try localStorage first, fallback to network
- **Conflict Resolution**: Server wins on conflicts (simple approach for Phase 1)

Key sync functions:
- `syncUsersFromServer()` - Fetch and cache all users
- `addCardToCollection()` - Add card with optimistic update
- `syncPendingChanges()` - Sync offline changes to server
- `fullSync()` - Complete bidirectional sync

### API Integration Patterns
Pokemon TCG API client (`src/lib/api/pokemon-tcg.ts`) features:
- **Smart Caching**: Search results (24h), individual cards (7d)
- **Batch Operations**: `getCardsByIds()` for efficient collection loading  
- **Rate Limiting**: Built-in request debouncing and caching
- **Offline Graceful**: Falls back to cached data when API unavailable

### Current Development Phase
**Phase 1 Complete**: User management and data foundation
- ✅ User selection/creation interface
- ✅ Supabase integration with RLS policies
- ✅ Pokemon TCG API client with caching
- ✅ Offline-first sync architecture

**Phase 2 In Progress**: Collection management UI
- Card search and add functionality
- Collection grid display
- Card detail views

## Important Implementation Notes

### Database Schema Features
- Uses UUIDs for all primary keys
- Automatic `updated_at` timestamp triggers
- Composite indexes for user+card queries
- Check constraints for data validation

### Performance Considerations
- All card images should use Next.js `<Image>` component
- API responses are aggressively cached in localStorage
- Debounced search to prevent API spam
- Lazy loading for large collections (Phase 3+)

### TypeScript Patterns
- Strict separation between database rows (`UserRow`) and app models (`User`)
- Conversion helpers: `userRowToUser()`, `collectionCardToRow()`
- Comprehensive type definitions in `src/lib/types.ts`

### Offline-First Design
- All user data cached locally for offline access
- Pending changes queue for offline modifications  
- Network status detection with graceful degradation
- Sync status indicators for user feedback

### Project Specification
Comprehensive project requirements and roadmap are documented in `spec.md`, including:
- Future authentication plans (Phase 2+)
- Social features roadmap (trading, sharing)
- Advanced features (price tracking, scanning)
- Accessibility requirements
- Analytics strategy

This is an active development project with clear phased approach - always check `spec.md` for detailed feature specifications and implementation priorities.