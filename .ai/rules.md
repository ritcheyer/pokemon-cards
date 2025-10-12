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

### Component Organization

#### Directory Structure
```
src/
├── components/
│   ├── ui/              # Reusable UI elements (Design System)
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── Button.module.css (if needed)
│   │   ├── Input/
│   │   ├── Card/
│   │   └── ...
│   └── features/        # Feature-specific component groupings
│       ├── CardGrid/
│       │   ├── CardGrid.tsx
│       │   ├── CardItem.tsx
│       │   └── CardGrid.module.css (if needed)
│       ├── UserProfile/
│       └── ...
├── app/
│   └── [page]/
│       ├── page.tsx
│       └── page.module.css (page-specific styles, if needed)
└── styles/
    └── globals.css      # Global styles
```

#### Component File Structure
- **Folder per component**: Each component gets its own folder
- **Co-located styles**: Component-specific styles live with the component
- **Page-specific styles**: Can live next to page file or in `globals.css`

**Example:**
```
src/components/ui/Button/
├── Button.tsx           # Component logic
└── Button.module.css    # Component styles (optional)
```

#### Component Categories

**UI Components** (`src/components/ui/`)
- Reusable, generic elements
- Design system building blocks
- Examples: Button, Input, Card, Modal, Dropdown
- Use **shadcn/ui** for base components
- Only create variants **as needed** (no premature optimization)
- Example: Don't create `iconOnly` button variant until it's actually used

**Feature Components** (`src/components/features/`)
- Groupings of UI components for specific features
- Consistent layouts and patterns
- Examples: CardGrid, UserProfile, SearchBar, CollectionStats
- Can contain multiple sub-components
- May have feature-specific state/logic

#### shadcn/ui Integration
- Install components to `src/components/ui/`
- Customize after installation as needed
- Keep modifications minimal and documented
- Install command: `npx shadcn-ui@latest add [component]`

#### When to Extract a Component
**Extract when:**
- Used in **2+ places** (DRY principle)
- Logical separation makes code clearer
- Component becomes too complex (>150 lines)

**Don't extract when:**
- Only used once and simple
- Premature abstraction
- Over-engineering for "future use"

#### Component Composition Patterns
**Prefer simplicity and high reuse:**
- **Simple props** for most cases
- **Compound components** when logical grouping makes sense
  ```tsx
  <Card>
    <Card.Header>Title</Card.Header>
    <Card.Body>Content</Card.Body>
  </Card>
  ```
- **Render props** only when necessary for flexibility
- **Children prop** for wrapper components

**Example - Simple Props:**
```tsx
<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>
```

**Example - Compound Components:**
```tsx
<Modal>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>
    <Button>Close</Button>
  </Modal.Footer>
</Modal>
```

### State Management

**Philosophy: KISS (Keep It Simple, Stupid)**
- Start simple, add complexity only when necessary
- Avoid premature optimization
- Use the simplest solution that works

#### Current Approach (Phase 1-2)
**React Hooks Only:**
- `useState` for local component state
- `useEffect` for side effects
- Custom hooks for reusable logic
- Props for parent-child communication

**Server State:**
- Handled by sync layer (`src/lib/db/sync.ts`)
- Supabase data + Pokemon TCG API
- Cached in localStorage
- No additional state library needed

**Client State:**
- UI state (modals, forms, filters, loading states)
- Keep in component state
- Lift to nearest common parent when shared

#### State Lifting Guidelines
- **Lift state up** to nearest common parent when multiple components need it
- **Don't lift** if only one component needs it
- **Max 2-3 levels** of props drilling before considering alternatives

#### When to Consider a State Library
**Triggers to evaluate:**
- Props drilling becomes painful (>3 levels deep)
- Multiple unrelated components need same state
- State updates become hard to track
- Performance issues with re-renders

**Options to consider (when needed):**
- **Context API** - Built-in, good for theme, user, simple global state
- **Zustand** - Minimal, simple API, good for medium complexity
- **Jotai** - Atomic state, good for granular updates
- **Redux** - Overkill for this project (avoid unless absolutely necessary)

**Current decision: Not needed yet. Revisit in Phase 3+**

### Error Handling
- Always use try/catch for async operations
- Show user-friendly error messages (no technical jargon)
- Log errors to console for debugging
- Never let the app crash - graceful degradation

### Error Boundaries & Progressive Enhancement

**Philosophy: Hybrid Approach**
- Server-render initial page (works without JS)
- JavaScript enhances functionality but isn't strictly required
- Graceful degradation when errors occur
- Focus on offline mode (which requires JS anyway)

#### Error Boundaries (Phase 2-3)

**When to Add:**
- Not critical for Phase 1 (KISS)
- Add in Phase 2-3 as app complexity grows
- Prevents full app crashes

**Where to Place:**
```tsx
// app/layout.tsx - Root level (Phase 2-3)
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary fallback={<ErrorFallback />}>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

**Simple Error Boundary Component:**
```tsx
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

**Fallback UI:**
```tsx
// components/ErrorFallback.tsx
export function ErrorFallback() {
  return (
    <div className="errorFallback">
      <h1>Something went wrong</h1>
      <p>We're sorry for the inconvenience.</p>
      <button onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>
  );
}
```

#### Progressive Enhancement Strategy

**Core Features (Work Without JS):**
- View collection (server-rendered)
- Navigate between users (standard `<a>` links)
- Basic page navigation

**Enhanced Features (Require JS):**
- Offline mode (localStorage)
- Optimistic updates
- Search autocomplete
- Modals and interactive UI
- Real-time sync

**Implementation Pattern:**
```tsx
// Server Component (works without JS)
export default async function CollectionPage({ params }) {
  const cards = await getCollection(params.userId);
  
  return (
    <>
      {/* Server-rendered, works without JS */}
      <CardList cards={cards} />
      
      {/* Client component, enhanced with JS */}
      <ClientSearchBar />
    </>
  );
}
```

**No-JavaScript Fallback:**
```tsx
// app/layout.tsx
<noscript>
  <div style={{ padding: '20px', background: '#fff3cd', border: '1px solid #ffc107' }}>
    <strong>JavaScript is disabled.</strong>
    <p>This app works best with JavaScript enabled. You can still view your collection, but offline mode and interactive features won't work.</p>
  </div>
</noscript>
```

#### Error Logging Strategy

**Current (Phase 1-2): Console Only**
- `console.error()` for debugging
- Browser DevTools for inspection
- Simple and sufficient for development

**Future (Phase 3+): Consider External Service**
- Sentry, LogRocket, or similar
- Track errors in production
- User session replay
- Only add when needed (KISS)

#### Recovery Patterns

**Automatic Retry (for network errors):**
```tsx
async function fetchWithRetry(fn: () => Promise<any>, retries = 3) {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(fn, retries - 1);
    }
    throw error;
  }
}
```

**Manual Retry (for user-triggered actions):**
```tsx
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div>
      <p>Failed to load. Please try again.</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  );
}
```

**Graceful Degradation:**
```tsx
// If feature fails, show cached data or simplified version
try {
  const liveData = await fetchLiveData();
  return <FullFeature data={liveData} />;
} catch (error) {
  const cachedData = getCachedData();
  return <SimplifiedFeature data={cachedData} />;
}
```

### Styling Guidelines

**Philosophy: KISS + Semantic Classes**
- Use Tailwind CSS but extract to meaningful class names
- Avoid inline Tailwind classes in JSX
- No custom CSS unless framework limitation
- Mobile-first responsive design

#### CSS Modules with Tailwind's `@apply`
**Preferred approach:**
```tsx
// Component: CardGrid.tsx
import styles from './CardGrid.module.css';

export function CardGrid() {
  return <div className={styles.cardGrid}>...</div>;
}
```

```css
/* CardGrid.module.css */
.cardGrid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6;
}

.cardItem {
  @apply rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow;
}
```

**Benefits:**
- Semantic, meaningful class names
- Easier to read and maintain
- Tailwind utilities still available
- Scoped to component (no conflicts)

#### When NOT to Use Custom CSS
- **Avoid custom CSS files** unless Tailwind can't handle it
- If Tailwind can't do it, consider if feature is necessary (KISS)
- Animations: Use Tailwind's built-in animations first
- Complex states: Try Tailwind variants (`hover:`, `focus:`, `active:`)

#### Responsive Design Strategy

**Mobile-First Approach:**
- Default classes = mobile (320px+)
- `md:` prefix = tablet (768px+)
- `lg:` prefix = desktop (1024px+)

**Three Breakpoints:**
```css
/* Mobile (default) - 320px+ */
.container {
  @apply p-4 text-sm;
}

/* Tablet - 768px+ */
.container {
  @apply md:p-6 md:text-base;
}

/* Desktop - 1024px+ */
.container {
  @apply lg:p-8 lg:text-lg;
}
```

**Testing Breakpoints:**
- **Mobile**: 320px (small phone), 375px (iPhone), 414px (large phone)
- **Tablet**: 768px (iPad portrait), 1024px (iPad landscape)
- **Desktop**: 1280px (Chromebook), 1440px+ (desktop)

#### Dark Mode (Phase 4)

**Current Approach:**
- Use Tailwind's `dark:` classes
```css
.card {
  @apply bg-white dark:bg-gray-800;
  @apply text-gray-900 dark:text-gray-100;
}
```

**Future Migration:**
- Transition to CSS Custom Properties (CSS variables)
- Allows more flexible theming
- Document migration path when needed

#### Color System

**Current: Tailwind Default Colors**
- Use Tailwind's built-in color palette
- No custom colors yet (KISS)
- Examples: `bg-blue-600`, `text-gray-900`, `border-gray-200`

**Future Considerations:**
- May extend with brand colors if needed
- May add CSS variables for theming
- Revisit in Phase 3-4

#### Class Naming Conventions (CSS Modules)
- **camelCase** for class names: `.cardGrid`, `.userProfile`, `.searchBar`
- **Descriptive names**: What it is, not how it looks
  - ✅ `.primaryButton`, `.cardGrid`, `.userAvatar`
  - ❌ `.blueButton`, `.fourColumns`, `.roundImage`
- **BEM-style** for variants (optional):
  - `.button`, `.button--primary`, `.button--disabled`

### Naming Conventions
- **Files**: kebab-case (`pokemon-tcg.ts`, `user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`, `CardGrid`)
- **Functions**: camelCase (`searchCards`, `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `CACHE_DURATION`)
- **Types/Interfaces**: PascalCase (`User`, `PokemonCard`)
- **CSS Classes**: camelCase (`.cardGrid`, `.primaryButton`)

---

## Git & Version Control

### Commit Message Format
Use **Conventional Commits** format:

```
<type>: <short description>

<detailed summary of changes from agentic chat log>

<optional footer with breaking changes, issues closed, etc.>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring (no feature change)
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks (deps, config, etc.)

**Examples:**
```
feat: add user selection interface

Created user selection screen with:
- User list display with avatar circles
- Create new user modal with form validation
- Auto-select newly created user
- Loading and error states
- Switch user functionality

Phase 1 user management complete.
```

```
fix: update Pokemon TCG API search to use wildcard matching

Changed search query from name:"query*" to name:*query* to enable
partial matching on both sides. This fixes the issue where searches
for "charizard" were returning zero results.

Added console logging for debugging search requests.
```

### Commit Frequency
- **User decides when to commit** based on milestones
- **Milestone definition**: 
  - Completion of a Phase (from `spec.md`)
  - Significant feature completion
  - Bug fix that resolves an issue
  - Documentation updates
  - User's discretion
- Commits should represent **complete, working state** (no broken code)

### Branch Strategy

#### Current (Early Development)
- **Direct commits to `main`**
- Simple, fast iteration during initial setup
- Suitable for solo development

#### Future (Feature-Complete State)
- **Feature branches**: `feature/short-description`
  - Example: `feature/card-grid`, `feature/dark-mode`
- **Bug fix branches**: `bugfix/short-description`
  - Example: `bugfix/search-timeout`, `bugfix/offline-sync`
- **Merge to `main`** when feature/fix is complete and tested
- Delete branch after merge

### What NOT to Commit
Respect `.gitignore` - never commit:
- `node_modules/` - Dependencies
- `.next/` - Build output
- `.env.local` - Environment variables (secrets)
- `*.log` - Log files
- `.DS_Store` - macOS system files
- Build artifacts and temporary files

**Always check** `git status` before committing to ensure no ignored files are staged.

### Pull Request Process

#### Current (Solo Project)
- **No PR process** - direct commits to `main`
- Self-review code before committing
- Run `npm run lint` before committing
- Ensure TypeScript compiles (`npm run build`)

#### Future (Team/Mature Project)
- Create PR from feature branch to `main`
- Self-review or peer review
- CI/CD checks must pass
- Squash and merge to keep history clean

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