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
- `shadcn/ui` - UI component library (install as needed)
- `lucide-react` - Icon library

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

# Add shadcn/ui component
npx shadcn@latest add [component-name]

# Example: Add button component
npx shadcn@latest add button
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
- Install command: `npx shadcn@latest add [component]`
- See full component library section below for details

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

## Security Considerations

**Philosophy: Trust Framework Defaults + KISS**
- Use trusted frameworks (Next.js, React, Supabase)
- Avoid dangerous patterns
- Add security layers only when needed
- Don't over-engineer for threats that don't exist yet

### Input Sanitization

**SQL Injection: ✅ Protected**
- Supabase uses parameterized queries automatically
- No raw SQL from user input
- Database constraints enforce data integrity

**User Input (names, notes):**
- React escapes output by default (safe)
- No manual sanitization needed for display
- Database constraints handle validation

**What to avoid:**
```tsx
// ❌ NEVER use dangerouslySetInnerHTML with user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ React escapes automatically
<div>{userInput}</div>
```

### XSS (Cross-Site Scripting) Prevention

**React's Default Protection: ✅ Safe**
- React escapes all values by default
- JSX prevents XSS automatically
- No additional sanitization needed

**Rules:**
- Never use `dangerouslySetInnerHTML` with user content
- Never use `eval()` or `Function()` constructor
- Trust React's escaping

### API Key Security

**Current Setup: ✅ Secure**
- `.env.local` in `.gitignore` (not committed)
- `NEXT_PUBLIC_*` prefix for client-exposed keys
- Supabase anon key is safe for client-side (RLS protects data)

**Environment Variables:**
```bash
# ✅ Safe - Server-side only
DATABASE_URL=secret

# ✅ Safe - Client-side, protected by RLS
NEXT_PUBLIC_SUPABASE_ANON_KEY=public_key

# ❌ NEVER commit .env.local to git
```

**Checklist:**
- [ ] `.env.local` in `.gitignore` ✅
- [ ] No secrets in client-side code ✅
- [ ] No API keys in commit history ✅

### Authentication & Authorization

**Phase 1: No Authentication**
- Simple name-based user selection
- No passwords or sensitive data
- Suitable for family/personal use
- All data is public within the app

**Future (Phase 3+): Supabase Auth**
- Add when multi-user/privacy needed
- Supabase Auth handles:
  - Password hashing
  - Session management
  - OAuth providers
  - Row Level Security (RLS)

**Migration Path:**
```typescript
// Phase 1: Simple user selection
const user = selectUser(name);

// Phase 3+: Authenticated users
const { data: { user } } = await supabase.auth.signIn({ email, password });
```

### Data Validation

**Three Layers:**

1. **Client-Side (UX):**
   ```tsx
   <input 
     type="text" 
     required 
     minLength={2}
     maxLength={50}
   />
   ```
   - Immediate feedback
   - Better user experience
   - NOT for security (can be bypassed)

2. **Server-Side (Security):**
   ```typescript
   // Server Action or API Route
   if (!name || name.length < 2) {
     throw new Error('Invalid name');
   }
   ```
   - Cannot be bypassed
   - Real security layer

3. **Database Constraints (Enforcement): ✅ Already implemented**
   ```sql
   CHECK (quantity > 0)
   CHECK (condition IN ('mint', 'near-mint', ...))
   ```
   - Final enforcement
   - Prevents bad data at source

**Current Approach:**
- Database constraints ✅ (already have)
- Client-side validation (add as needed)
- Server-side validation (add in Phase 2+)

### Content Security Policy (CSP)

**Current: Next.js Defaults ✅**
- Next.js provides secure defaults
- No custom CSP needed yet (KISS)

**Future (Production):**
- Consider adding CSP headers
- Restrict script sources
- Add in Phase 4 (deployment hardening)

### Rate Limiting

**Current: Not Needed**
- Family/personal app
- Low traffic
- Pokemon TCG API has its own limits

**Future: Consider if needed**
- Add if app becomes public
- Supabase has built-in rate limiting
- Implement at API route level if needed

### Secure Coding Practices

**Do:**
- ✅ Use TypeScript (type safety)
- ✅ Validate user input
- ✅ Use HTTPS in production (Vercel default)
- ✅ Keep dependencies updated
- ✅ Use environment variables for secrets

**Don't:**
- ❌ Use `dangerouslySetInnerHTML` with user input
- ❌ Use `eval()` or `new Function()`
- ❌ Commit secrets to git
- ❌ Trust client-side validation alone
- ❌ Expose sensitive data in client code

### Security Checklist

**Phase 1 (Current):**
- [x] `.env.local` in `.gitignore`
- [x] No secrets in client code
- [x] React's XSS protection (default)
- [x] Supabase SQL injection protection (default)
- [x] Database constraints for data validation

**Phase 2-3 (Future):**
- [ ] Add authentication (Supabase Auth)
- [ ] Server-side input validation
- [ ] Rate limiting (if needed)
- [ ] Content Security Policy headers

**Phase 4 (Production Hardening):**
- [ ] Security audit
- [ ] Penetration testing (if public)
- [ ] HTTPS enforcement
- [ ] Regular dependency updates

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

## Component Library (shadcn/ui + Lucide Icons)

### shadcn/ui

**What is it?**
- Collection of re-usable components built with Radix UI and Tailwind CSS
- Copy-paste components (not an npm package)
- Full ownership and customization
- Accessible by default (WCAG AA compliant)

**Installation:**
```bash
# Initialize shadcn/ui (first time only)
npx shadcn@latest init

# Add individual components as needed
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add input
npx shadcn@latest add dropdown-menu
```

**Where Components Go:**
- Installed to `src/components/ui/`
- Each component in its own folder
- Fully customizable after installation

**Common Components for This Project:**
```bash
# Phase 2 - Collection UI
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add input
npx shadcn@latest add badge

# Phase 3 - Enhanced Features
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add tooltip
npx shadcn@latest add skeleton
```

**Customization Guidelines:**
- Modify components after installation as needed
- Keep changes minimal and documented
- Use CSS Modules with `@apply` for custom styles
- Maintain accessibility features

**Example Usage:**
```tsx
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function CardItem({ card }) {
  return (
    <Card>
      <Card.Header>
        <h3>{card.name}</h3>
      </Card.Header>
      <Card.Body>
        <img src={card.images.small} alt={card.name} />
      </Card.Body>
      <Card.Footer>
        <Button>Add to Collection</Button>
      </Card.Footer>
    </Card>
  );
}
```

### Lucide Icons

**What is it?**
- Beautiful, consistent icon library
- Tree-shakeable (only imports icons you use)
- Customizable size and color
- Accessible with proper ARIA labels

**Installation:**
```bash
npm install lucide-react
```

**Usage:**
```tsx
import { Search, Plus, Trash2, Settings } from 'lucide-react';

// Basic usage
<Search className="w-5 h-5" />

// With Tailwind classes
<Plus className="w-6 h-6 text-blue-600" />

// In buttons
<button>
  <Trash2 className="w-4 h-4 mr-2" />
  Delete
</button>

// Icon-only button (needs aria-label)
<button aria-label="Settings">
  <Settings className="w-5 h-5" />
</button>
```

**Common Icons for This Project:**
- `Search` - Search functionality
- `Plus` - Add card
- `Trash2` - Delete card
- `Edit` - Edit details
- `Filter` - Filter options
- `SortAsc`, `SortDesc` - Sorting
- `User` - User profile
- `Settings` - Settings
- `X` - Close modals
- `ChevronDown`, `ChevronUp` - Dropdowns
- `Loader2` - Loading spinner (with animation)

**Icon Sizing Convention:**
```tsx
// Small (16px) - inline with text
<Icon className="w-4 h-4" />

// Medium (20px) - buttons, UI elements
<Icon className="w-5 h-5" />

// Large (24px) - prominent actions
<Icon className="w-6 h-6" />

// Extra large (32px+) - empty states, headers
<Icon className="w-8 h-8" />
```

**Accessibility:**
```tsx
// Decorative icon (has visible text)
<button>
  <Plus className="w-4 h-4" aria-hidden="true" />
  Add Card
</button>

// Functional icon (no visible text)
<button aria-label="Close">
  <X className="w-5 h-5" />
</button>

// Loading spinner
<Loader2 className="w-5 h-5 animate-spin" aria-label="Loading" />
```

### Component Library Best Practices

**Install as Needed:**
- Don't install all components upfront (KISS)
- Add components when you need them
- Only install variants when required

**Customization:**
- Modify after installation
- Document significant changes
- Keep accessibility features intact

**Consistency:**
- Use same components across app
- Follow established patterns
- Maintain visual consistency

**Performance:**
- Lucide icons are tree-shaken (only bundle what you use)
- shadcn components are optimized by default
- No performance concerns with either library

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

## Deployment

**Platform: Vercel (Recommended)**
- Free tier for hobby projects
- Automatic deployments from git
- Built-in Next.js optimization
- Zero configuration needed

### Initial Setup

**1. Connect Repository:**
```bash
# Push to GitHub (if not already)
git remote add origin <your-repo-url>
git push -u origin main

# Go to vercel.com
# Click "New Project"
# Import your GitHub repository
```

**2. Configure Project:**
- Framework Preset: **Next.js** (auto-detected)
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

**3. Environment Variables:**
Add in Vercel dashboard (Settings → Environment Variables):
```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_POKEMON_TCG_API_KEY=<your-api-key>
```

**4. Deploy:**
- Click "Deploy"
- Wait for build to complete
- Get your URL: `your-app.vercel.app`

### Automatic Deployments

**Production (main branch):**
- Every push to `main` triggers deployment
- Automatic builds and deploys
- Live at: `your-app.vercel.app`

**Preview Deployments (future):**
- When using feature branches
- Each branch gets preview URL
- Test before merging to main

### Custom Domain (Optional)

**Add Custom Domain:**
1. Go to Vercel dashboard → Domains
2. Add your domain
3. Update DNS records (Vercel provides instructions)
4. Automatic HTTPS certificate

**Not needed for Phase 1-2** (KISS)

### Build Optimization

**Vercel Handles:**
- ✅ Image optimization (Next.js Image component)
- ✅ Code splitting and bundling
- ✅ Edge caching
- ✅ Compression (gzip/brotli)
- ✅ HTTPS by default

**No additional configuration needed**

### Environment-Specific Settings

**Development:**
```bash
# .env.local (local only, gitignored)
NEXT_PUBLIC_SUPABASE_URL=...
```

**Production:**
```bash
# Vercel dashboard → Environment Variables
# Same variables as .env.local
```

**Staging (future):**
```bash
# Create separate Vercel project for staging
# Use different Supabase project/database
```

### Deployment Checklist

**Before First Deploy:**
- [ ] Push code to GitHub
- [ ] Create Vercel account
- [ ] Add environment variables in Vercel
- [ ] Verify Supabase project is accessible
- [ ] Test build locally (`npm run build`)

**Before Each Deploy:**
- [ ] Code committed to git
- [ ] Tests passing (when added)
- [ ] No console errors
- [ ] TypeScript compiles (`npm run build`)
- [ ] Environment variables up to date

**After Deploy:**
- [ ] Test production URL
- [ ] Verify database connection works
- [ ] Check Pokemon TCG API integration
- [ ] Test on mobile device
- [ ] Verify offline mode works

### Monitoring & Logs

**Vercel Dashboard:**
- Build logs (if deployment fails)
- Runtime logs (server errors)
- Analytics (page views, performance)

**Access Logs:**
1. Go to Vercel dashboard
2. Select your project
3. Click "Deployments"
4. Click on specific deployment
5. View "Build Logs" or "Function Logs"

### Troubleshooting

**Build Fails:**
- Check build logs in Vercel dashboard
- Verify all dependencies in `package.json`
- Test build locally: `npm run build`
- Check environment variables are set

**Runtime Errors:**
- Check Function Logs in Vercel
- Verify environment variables
- Test Supabase connection
- Check API rate limits

**Slow Performance:**
- Use Next.js Image component (automatic optimization)
- Implement caching (already using localStorage)
- Consider CDN for static assets (Vercel handles this)

### Rollback

**If deployment breaks:**
1. Go to Vercel dashboard → Deployments
2. Find last working deployment
3. Click "..." menu → "Promote to Production"
4. Instant rollback to previous version

### Cost Considerations

**Vercel Free Tier (Hobby):**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ✅ More than enough for personal/family app

**If You Exceed Free Tier:**
- Upgrade to Pro ($20/month)
- Or optimize (unlikely for this app)

### Alternative Platforms (Future)

**If Vercel doesn't work:**
- **Netlify** - Similar to Vercel
- **Railway** - Good for full-stack apps
- **Fly.io** - More control, slightly more complex
- **Self-hosted** - VPS, Docker, etc.

**Stick with Vercel for now** (KISS)

---

## Analytics & Monitoring

**Current: Not Implemented (Phase 1-2)**
- No analytics yet (KISS)
- Console logging for debugging
- Add when needed in Phase 3+

**Future: Vercel Analytics (Phase 3+)**
- Built-in with Vercel hosting
- Privacy-friendly (no cookies, GDPR compliant)
- Zero configuration (enable in dashboard)
- Automatic tracking: page views, performance, traffic

**Implementation (when needed):**
```bash
npm install @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**See `spec.md` for detailed analytics strategy**

---

## Internationalization (i18n)

**Current: English Only**
- Hobby/family project
- No i18n needed (KISS)
- All text in English

**Future: If Needed (Phase 4+)**
- Consider `next-intl` or similar
- Only add if user base expands
- Not a priority for personal use

**Current Approach:**
- Hard-coded English strings
- No translation keys
- Simple and maintainable

---

## Debugging Guidelines

**Browser DevTools:**
- **Console**: Check for errors, warnings, logs
- **Network Tab**: Inspect API calls (Pokemon TCG, Supabase)
- **Application Tab**: Inspect localStorage cache
- **React DevTools**: Component hierarchy, props, state

**Common Debugging Scenarios:**

**1. Search Returns No Results:**
```typescript
// Check console for API URL
console.log('Searching Pokemon TCG API:', url);
console.log(`Found ${result.data.length} cards for query: ${query}`);

// Verify search query format
// Should be: name:*query*
```

**2. Offline Sync Not Working:**
```typescript
// Check localStorage
localStorage.getItem('pokemon-collection-pending-changes');

// Check sync status
import { getSyncStatus } from '@/lib/db/sync';
console.log('Sync status:', getSyncStatus());
```

**3. Supabase Connection Issues:**
```typescript
// Test connection
import { testSupabaseConnection } from '@/lib/db/supabase';
const isConnected = await testSupabaseConnection();
console.log('Supabase connected:', isConnected);
```

**4. TypeScript Errors:**
```bash
# Check types
npm run build

# Or use TypeScript directly
npx tsc --noEmit
```

**Debugging Tools:**
- **React DevTools**: Install browser extension
- **Network Throttling**: Test slow connections
- **Lighthouse**: Performance and accessibility audits
- **Console Logs**: Already implemented throughout codebase

**Best Practices:**
- Add descriptive console.logs during development
- Remove or comment out before committing
- Use `console.error()` for errors
- Use `console.warn()` for warnings
- Use `console.log()` for debugging info

---

## Future Considerations

**Authentication (Phase 3+):**
- Supabase Auth for user accounts
- Email/password or OAuth (Google, GitHub)
- Row Level Security (RLS) policies
- Migration path documented in Security section

**Multi-Device Sync:**
- Already implemented via Supabase
- Conflict resolution: last-write-wins (current)
- Consider more sophisticated conflict resolution if needed

**Data Export/Backup:**
- Export collection to JSON
- Import from JSON
- CSV export for spreadsheet analysis
- Add in Phase 3-4 if needed

**Advanced Features (Phase 5+):**
- Price tracking and alerts
- Card scanning (camera + OCR)
- Trading/wishlist features
- Social features (share collections)
- See `spec.md` for full roadmap

**Performance Optimization:**
- Virtual scrolling for large collections (1000+ cards)
- Image lazy loading (already using Next.js Image)
- Service Worker for better offline support
- IndexedDB instead of localStorage (if needed)

**Testing (Future):**
- Unit tests (Jest + React Testing Library)
- E2E tests (Playwright)
- Add when codebase stabilizes
- Not needed for Phase 1-2 (KISS)

**Accessibility Audit (Phase 4):**
- Screen reader testing
- Keyboard navigation verification
- Color contrast audit
- WCAG AAA compliance (currently targeting AA)

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