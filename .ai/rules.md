# AI Assistant Rules - Pokemon Card Collection

> **Central rules file for all AI assistants (Claude, Warp, Copilot, etc.)**
> This file combines technical architecture details with coding guidelines and behavioral expectations.

## Project Overview
A Pokemon card collection management app for a parent and child. Built with Next.js, TypeScript, Supabase, and Pokemon TCG API. Must work offline (Chromebook at school).

**Primary Users**: Parent + child (8-10 years old)  
**Primary Devices**: Chromebook (offline) + iPad  
**Key Requirement**: Offline-first architecture

---

## Core Principles
1. **Always read `spec.md` first** - It's the source of truth for features and requirements
2. **Offline-first architecture** - Everything must work without internet
3. **Kid-friendly UI** - Simple, visual, intuitive for children
4. **Type safety** - Use TypeScript strictly, no `any` types
5. **Progressive enhancement** - Core features work without JavaScript

---

## Tech Stack

### Framework & Language
- **Framework**: Next.js 15.5.4 (App Router with Turbopack)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4
- **Fonts**: Geist Sans and Geist Mono

### Backend & APIs
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **External API**: Pokemon TCG API v2 (https://api.pokemontcg.io/v2)
- **State Management**: React hooks (no external state library yet)

### Key Dependencies
- `@supabase/supabase-js` - Database client
- `clsx` - Conditional classnames
- `tailwind-merge` - Merge Tailwind classes

---

## Development Commands

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

---

## Environment Setup

Create `.env.local` with these variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_POKEMON_TCG_API_KEY=<optional-pokemon-tcg-api-key>
```

### Database Setup
1. Go to Supabase Dashboard → SQL Editor
2. Run the schema from `supabase-schema.sql`
3. Verify tables: `users`, `collection_cards`

---

## Architecture Overview

### Data Flow (Hybrid Offline-First)
The application uses three data layers:

1. **Pokemon TCG API** → Card metadata and images
2. **Supabase Database** → User collections and profiles  
3. **localStorage Cache** → Offline support and performance

**Pattern**: Optimistic updates with automatic sync fallback
- All mutations update localStorage immediately
- Then sync to Supabase when online
- Queue changes when offline, sync when reconnected

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with fonts
│   └── page.tsx           # User selection + collection view
├── lib/
│   ├── types.ts           # All TypeScript interfaces
│   ├── utils.ts           # Helper functions
│   ├── api/
│   │   └── pokemon-tcg.ts # Pokemon TCG API client with caching
│   ├── db/
│   │   ├── supabase.ts    # Supabase client configuration
│   │   ├── sync.ts        # Offline-first sync layer
│   │   └── database.types.ts  # Generated DB types
│   └── storage/
│       └── localStorage.ts # Cache management utilities
```

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

#### PokemonCard (From TCG API)
```typescript
interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  hp?: string;
  types?: string[];
  rarity?: string;
  set: { id: string; name: string; series: string; releaseDate: string; images: {...} };
  images: { small: string; large: string };
  tcgplayer?: { prices?: {...} };
  attacks?: Array<{...}>;
  abilities?: Array<{...}>;
}
```

---

## Sync System Design

### Sync Layer (`src/lib/db/sync.ts`)
Implements offline-first architecture with:
- **Optimistic Updates**: UI updates immediately, syncs in background
- **Offline Queue**: Changes stored locally when offline, synced when reconnected
- **Cache-First**: Always try localStorage first, fallback to network
- **Conflict Resolution**: Last-write-wins (simple approach for Phase 1)
- **Sync Status**: Tracking with event listeners for UI feedback

### Key Sync Functions
- `syncUsersFromServer()` - Fetch and cache all users
- `createUser(name, avatar?)` - Create new user
- `syncCollectionFromServer(userId)` - Fetch user's collection
- `addCardToCollection(...)` - Add card with optimistic update
- `updateCardInCollection(...)` - Update card details
- `deleteCardFromCollection(...)` - Remove card
- `syncPendingChanges()` - Sync offline changes to server
- `fullSync(userId)` - Complete bidirectional sync

### Caching Strategy
- **Search results**: 24 hours
- **Card details**: 7 days
- **User data**: Until manual refresh
- **Collection**: Real-time with optimistic updates

---

## API Integration

### Pokemon TCG API Client (`src/lib/api/pokemon-tcg.ts`)
Features:
- **Smart Caching**: Search results (24h), individual cards (7d)
- **Batch Operations**: `getCardsByIds()` for efficient collection loading  
- **Rate Limiting**: Built-in request debouncing and caching
- **Offline Graceful**: Falls back to cached data when API unavailable
- **Wildcard Search**: Uses `name:*query*` for partial matching

### Key API Functions
- `searchCards(query)` - Search by name with wildcard
- `getCardById(cardId)` - Fetch single card
- `getCardsByIds(cardIds[])` - Batch fetch multiple cards
- `getTypes()` - Get all Pokemon types
- `getRarities()` - Get all card rarities
- `getSets()` - Get all card sets

### API Rate Limits
- **Without API key**: 20 requests/minute
- **With API key**: 1000 requests/minute

---

## Code Conventions

### TypeScript
- Use strict mode
- Define interfaces in `src/lib/types.ts`
- Use `type` for unions/primitives, `interface` for objects
- Always type function parameters and return values
- Use `async/await` over `.then()` chains
- Strict separation between database rows (`UserRow`) and app models (`User`)
- Conversion helpers: `userRowToUser()`, `collectionCardToRow()`

### React Components
- Functional components only
- Use hooks (`useState`, `useEffect`, etc.)
- Extract reusable logic into custom hooks
- Keep components focused (single responsibility)

### Error Handling
- Always use try/catch for async operations
- Show user-friendly error messages (no technical jargon)
- Log errors to console for debugging
- Never let the app crash - graceful degradation

### Naming Conventions
- **Files**: kebab-case (`pokemon-tcg.ts`, `user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`, `CardGrid`)
- **Functions**: camelCase (`searchCards`, `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `CACHE_DURATION`)
- **Types/Interfaces**: PascalCase (`User`, `PokemonCard`)

---

## Database Schema

### Tables

#### `users`
- `id` (UUID, primary key)
- `name` (TEXT, required)
- `created_at` (TIMESTAMPTZ, auto)
- `avatar` (TEXT, optional)

#### `collection_cards`
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key → users.id, cascade delete)
- `card_id` (TEXT, Pokemon TCG API ID)
- `quantity` (INTEGER, default 1, check > 0)
- `condition` (TEXT, enum: mint, near-mint, excellent, good, played, poor)
- `added_at` (TIMESTAMPTZ, auto)
- `notes` (TEXT, optional)
- `updated_at` (TIMESTAMPTZ, auto-update trigger)

### Indexes
- `idx_collection_cards_user_id` on `user_id`
- `idx_collection_cards_card_id` on `card_id`
- `idx_collection_cards_added_at` on `added_at DESC`
- `idx_collection_cards_user_card` composite on `(user_id, card_id)`

### Features
- Automatic `updated_at` timestamp triggers
- Row Level Security (RLS) enabled (allow all for Phase 1)
- Check constraints for data validation

---

## Accessibility Requirements

- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`, etc.)
- Never use `<div onClick>` - use proper interactive elements
- Keyboard navigation must work (Tab, Enter, Escape, Arrow keys)
- ARIA labels for icon-only buttons
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Focus indicators must be visible
- Alt text for all images
- Form labels properly associated

---

## UI/UX Guidelines

### Loading States
- Always show spinners/skeletons during async operations
- Disable buttons during loading
- Show "Loading..." text for screen readers

### Empty States
- Helpful messages with clear CTAs
- Example: "No cards yet. Search to add your first card!"

### Error States
- User-friendly messages with retry options
- Example: "Failed to load cards. Check your connection and try again."

### Success Feedback
- Subtle confirmations (toasts, checkmarks)
- Auto-dismiss after 3-5 seconds

### Mobile-First
- Design for small screens (320px+), enhance for desktop
- Touch targets minimum 44x44px
- Responsive grid layouts

---

## Development Workflow

### Before Making Changes
1. Read relevant section of `spec.md`
2. Check existing code patterns
3. Verify types in `src/lib/types.ts`
4. Consider offline behavior

### When Adding Features
1. Update `spec.md` if needed
2. Add/update TypeScript types
3. Implement data layer first (sync functions)
4. Build UI components
5. Add error handling
6. Test offline behavior
7. Update TODO list in spec

### When Fixing Bugs
1. Identify root cause (not symptoms)
2. Check if it affects offline mode
3. Add defensive code to prevent recurrence
4. Consider edge cases

---

## Common Code Patterns

### Async Data Fetching
```typescript
const [data, setData] = useState<Type[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await syncFunction();
      setData(result);
    } catch (err) {
      console.error('Error:', err);
      setError('User-friendly message');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### Form Handling
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!isValid) return;
  
  setLoading(true);
  try {
    await syncFunction(data);
    // Success handling
  } catch (err) {
    // Error handling
  } finally {
    setLoading(false);
  }
};
```

### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src={card.images.small}
  alt={card.name}
  width={245}
  height={342}
  loading="lazy"
  className="rounded-lg"
/>
```

---

## Performance Considerations

- All card images should use Next.js `<Image>` component
- API responses are aggressively cached in localStorage
- Debounced search to prevent API spam (300ms recommended)
- Lazy loading for large collections (Phase 3+)
- Batch API requests when possible (`getCardsByIds`)

---

## Testing Checklist

- [ ] Works online
- [ ] Works offline
- [ ] Handles errors gracefully
- [ ] Loading states show correctly
- [ ] Keyboard navigation works
- [ ] Mobile responsive (320px+)
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] Accessibility: semantic HTML, ARIA labels
- [ ] Performance: images optimized, API cached

---

## Phase Status

- ✅ **Phase 1**: Foundation & User Management (COMPLETE)
  - User selection/creation interface
  - Supabase integration with RLS policies
  - Pokemon TCG API client with caching
  - Offline-first sync architecture
  - localStorage utilities
  - TypeScript types and data models

- 🚧 **Phase 2**: Collection Management UI (NEXT)
  - Collection grid view
  - Card detail modal
  - Add card functionality (search + add)
  - Delete card functionality

- ⏳ **Phase 3**: Enhanced Features
  - Search and filter implementation
  - Sorting functionality
  - Edit card details
  - Statistics dashboard

- ⏳ **Phase 4**: Polish
  - Dark mode implementation
  - Responsive design refinement
  - Performance optimization
  - Accessibility audit

---

## Known Issues & UX Improvements

### Phase 1 UX Improvements
- [ ] Implement fuzzy search (ensure partial name matching works correctly)
- [ ] Add loading indicator/feedback when search is in progress
- [ ] Investigate and optimize search performance (currently ~1 minute response time)
- [ ] Show result count to user (e.g., "Showing 8 of 50+ results")

---

## Important Notes

- **Data privacy**: No authentication yet (Phase 1), simple name-based users
- **Performance**: Search can be slow (~1 min), needs optimization
- **Offline requirement**: Must work on Chromebook at school without internet
- **User age**: Child is 8-10 years old, UI must be simple and intuitive
- **Multiple users**: Parent and child share device, need easy user switching

---

## Project Documentation

- **`spec.md`**: Comprehensive project requirements and roadmap
- **`supabase-schema.sql`**: Database schema with comments
- **`README.md`**: Project setup and getting started
- **`.ai/rules.md`**: This file - central AI assistant rules

---

## Communication Guidelines for AI Assistants

- Be concise and direct
- Explain technical decisions when relevant
- Suggest alternatives when appropriate
- Point out potential issues proactively
- Ask for clarification rather than assume
- Test offline behavior for all changes
- Use emojis sparingly (✅ ❌ 🚧 ⏳ only)

---

## When in Doubt

1. Check `spec.md` for requirements
2. Follow existing code patterns
3. Prioritize user experience over technical perfection
4. Ask for clarification rather than assume
5. Test offline behavior
6. Keep it simple - this is for a child to use