# Pokemon Card Collection Website - Project Specification

## Project Overview
A Next.js-based web application for managing and viewing a Pokemon card collection. The application will support multiple users, each with their own separate collection, and integrate with the Pokemon TCG API for card data and images.

## Technical Stack

### Core Technologies
- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Runtime**: React 19.1.0

### Additional Libraries
- **UI Components**: shadcn/ui (to be added)
- **Icons**: Lucide React (to be added)
- **Data Fetching**: Pokemon TCG API (https://pokemontcg.io/)
- **State Management**: React hooks + Context API
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Data Persistence**: Hybrid approach (localStorage + Supabase sync)
- **Analytics**: Vercel Analytics (privacy-friendly, zero-config)

## Data Architecture

### Data Source Strategy
**Option A: Pokemon TCG API Integration**
- Use Pokemon TCG API for card lookup and metadata
- Store user's owned cards locally with references to API card IDs
- Cache API responses to minimize requests
- Fallback handling for offline mode

### Data Models

#### User
```typescript
interface User {
  id: string;
  name: string;
  createdAt: string;
  avatar?: string;
}
```

#### Card (from Pokemon TCG API)
```typescript
interface PokemonCard {
  id: string;                    // API card ID
  name: string;
  supertype: string;             // Pokémon, Trainer, Energy
  subtypes: string[];            // Stage 1, Basic, etc.
  hp?: string;
  types?: string[];              // Fire, Water, Grass, etc.
  rarity?: string;               // Common, Uncommon, Rare, etc.
  set: {
    id: string;
    name: string;
    series: string;
    releaseDate: string;
    images: {
      symbol: string;
      logo: string;
    };
  };
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    prices?: {
      [key: string]: {
        market?: number;
      };
    };
  };
}
```

#### CollectionCard (User's owned card)
```typescript
interface CollectionCard {
  id: string;                    // Unique collection entry ID
  userId: string;                // Owner reference
  cardId: string;                // Pokemon TCG API card ID
  quantity: number;
  condition: 'mint' | 'near-mint' | 'excellent' | 'good' | 'played' | 'poor';
  addedAt: string;               // ISO date string
  notes?: string;
}
```

## Feature Specifications

### Phase 1: Core Features

#### 1. User Management
- **User Selection Screen**
  - Display all users as cards/buttons
  - "Add New User" button
  - Simple name input (no authentication)
  - Store users in localStorage

#### 2. Collection View (Main Page)
- **Layout**: Responsive grid of cards
  - Desktop: 4-6 cards per row
  - Tablet: 3-4 cards per row
  - Mobile: 2 cards per row
- **Card Display**:
  - Card image (from API)
  - Card name
  - Set name and icon
  - Rarity indicator
  - Quantity badge (if > 1)
  - Condition indicator
- **Empty State**: Friendly message with "Add Card" CTA

#### 3. Search & Filter
- **Search Bar**: Search by card name (real-time)
- **Filters**:
  - Type (Fire, Water, Grass, etc.)
  - Rarity (Common, Uncommon, Rare, etc.)
  - Set/Series
  - Condition
  - Custom Tags (Phase 4 - when tagging feature is added)
- **Filter UI**: Dropdown or sidebar panel
- **Clear Filters** button

#### 4. Sorting
- Sort options:
  - Alphabetical (A-Z, Z-A)
  - Date Added (Newest, Oldest)
  - Rarity (Rare to Common, Common to Rare)
  - Set (by release date)
  - Value (High to Low, Low to High)
- Dropdown selector in header

#### 5. Card Detail View
- **Modal or Side Panel** with:
  - Large card image
  - Full card details (HP, type, attacks, abilities)
  - Set information
  - Rarity
  - Market value (if available from API)
  - Price history graph (Phase 5 - when price tracking is added)
  - User's quantity and condition
  - Notes field
  - Edit/Delete buttons

#### 6. Add Card Form
- **Two-step process**:
  1. Search Pokemon TCG API for card
  2. Add collection details (quantity, condition, notes)
- **Search Interface (Hybrid Approach)**:
  - **Online**: Search Pokemon TCG API directly
    - Text input for card name
    - Results grid with card previews from API
    - Click to select card
  - **Offline**: Limited functionality
    - Show "Connect to internet to search for cards" message
    - Optional: Manual entry mode (card name/number, validates when online)
  - Cache search results for faster subsequent searches
- **Collection Details Form**:
  - Quantity input (number)
  - Condition dropdown
  - Notes textarea (optional)
  - Save/Cancel buttons

#### 7. Statistics Dashboard
- **Overview Cards**:
  - Total cards count
  - Unique cards count
  - Total collection value (estimated)
  - Completion percentage (optional)
- **Breakdown Charts/Lists**:
  - Cards by rarity (pie chart or list)
  - Cards by type (bar chart or list)
  - Cards by set (list with counts)
  - Most valuable cards (top 5-10)

#### 8. Responsive Design
- Mobile-first approach
- Breakpoints:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- Touch-friendly buttons and interactions
- Optimized images for different screen sizes

#### 9. Dark Mode Support
- System preference detection
- Manual toggle switch
- Persist preference in localStorage
- Tailwind dark mode classes

#### 10. Data Persistence
- **Phase 1**: localStorage
  - Store users array
  - Store collection cards array
  - Store user preferences (theme, last selected user)
- **Phase 2** (Future): Database migration
  - Vercel Postgres or similar
  - Export/import functionality for migration

## API Integration

### Pokemon TCG API
- **Base URL**: `https://api.pokemontcg.io/v2`
- **API Key**: Required (free tier available)
- **Endpoints to use**:
  - `GET /cards` - Search cards
  - `GET /cards/:id` - Get card details
  - `GET /sets` - Get all sets
  - `GET /types` - Get all types
  - `GET /rarities` - Get all rarities

### Rate Limiting
- Implement request caching
- Debounce search inputs
- Cache card details locally after first fetch

## UI/UX Design Guidelines

### Design Style
- **Aesthetic**: Clean, minimal, functional
- **Color Palette**: 
  - Light mode: White/light gray backgrounds, dark text
  - Dark mode: Dark gray/black backgrounds, light text
  - Accent colors from Pokemon types (red, blue, green, etc.)
- **Typography**: System fonts (already configured in Next.js)
- **Spacing**: Consistent use of Tailwind spacing scale

### Component Structure
```
src/
├── app/
│   ├── layout.tsx              # Root layout with theme provider
│   ├── page.tsx                # User selection page
│   ├── [userId]/
│   │   ├── layout.tsx          # User-specific layout with nav
│   │   ├── page.tsx            # Collection view
│   │   ├── add/page.tsx        # Add card page
│   │   └── stats/page.tsx      # Statistics page
│   └── globals.css
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── CardGrid.tsx
│   ├── CardItem.tsx
│   ├── CardDetail.tsx
│   ├── SearchBar.tsx
│   ├── FilterPanel.tsx
│   ├── AddCardForm.tsx
│   ├── UserSelector.tsx
│   ├── StatsCard.tsx
│   └── ThemeToggle.tsx
├── lib/
│   ├── api/
│   │   └── pokemon-tcg.ts      # API client
│   ├── storage/
│   │   └── localStorage.ts      # Storage utilities
│   ├── types.ts                # TypeScript interfaces
│   └── utils.ts                # Helper functions
└── hooks/
    ├── useCollection.ts
    ├── useUsers.ts
    └── useTheme.ts
```

## Development Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up Pokemon TCG API integration
- [ ] Create data models and TypeScript types
- [ ] Implement localStorage utilities
- [ ] Build user management (selection + creation)

### Phase 2: Core Collection Features (Week 2)
- [ ] Collection grid view
- [ ] Card detail modal
- [ ] Add card functionality (search + add)
- [ ] Delete card functionality

### Phase 3: Enhanced Features (Week 3)
- [ ] Search and filter implementation
- [ ] Sorting functionality
- [ ] Edit card details
- [ ] Statistics dashboard

### Phase 4: Polish (Week 4)
- [ ] Dark mode implementation
- [ ] Responsive design refinement
- [ ] Performance optimization
- [ ] Error handling and loading states
- [ ] Empty states and user feedback

## Future Enhancements (Post-MVP)

### Phase 2: Authentication & Security
- **User Authentication** (Supabase Auth)
  - Email/password sign up and login
  - Social login (Google, Apple)
  - Password reset via email
  - Email verification
  - Parent/admin controls
  - Migrate simple name-based users to authenticated accounts
- **User Administration**
  - Account recovery flows
  - Profile management
  - Privacy settings

### Phase 3: Social Features
- **Friending System**
  - Send/accept friend requests
  - Friends list
  - View friends' collections (with permission)
- **Collection Sharing**
  - Public profile pages
  - Share collection via link
  - Privacy controls (public/friends-only/private)
- **Trading Functionality**
  - Propose trades between users
  - Trade history
  - Trade notifications

### Phase 4: Enhanced Collection Features
- **Wishlist**
  - Mark cards as "wanted"
  - Track wishlist separately from collection
  - Wishlist sharing
    - Generate unique shareable link (e.g., `/wishlist/abc123xyz`)
    - Copy link to clipboard
    - Anyone with link can view (no login required)
    - Revoke share link option
    - QR code generation (future enhancement - great for in-person sharing at parties/events)
- **Card Photos**
  - Upload custom photos of cards (Supabase Storage)
  - Multiple photos per card
  - Photo gallery view
- **Advanced Organization**
  - Custom tags/categories
    - User-defined tags (e.g., "Favorites", "For Trade", "Rare Pulls")
    - Multi-tag support (cards can have multiple tags)
    - Tag management (create, edit, delete tags)
    - Filter and search by tags
  - Multiple collections per user
  - Binders/folders organization

### Phase 5: Advanced Features
- **Offline Enhancements**
  - Full offline card search (download entire TCG database to IndexedDB)
    - ~60MB metadata download for ~20,000+ cards
    - Periodic sync for new sets/cards
    - Enables adding cards while completely offline
  - Selective set downloads (download only recent/favorite sets)
- **Export & Print**
  - Export collection to CSV/PDF
  - Print collection list
  - Generate collection reports
- **Scanning & Quick Add**
  - Barcode/QR code scanning
  - Bulk import from CSV
  - Camera-based card recognition (ML)
- **Market Features**
  - Price tracking with TCGPlayer API
    - Historical pricing data (daily/weekly snapshots)
    - Price history graphs per card (line charts showing value over time)
    - Store price snapshots in database for long-term tracking
    - Chart library integration (Recharts or Chart.js)
  - Price alerts
    - Set target prices for cards
    - Notifications when card reaches target price
    - Price increase/decrease alerts
  - Collection value tracking
    - Total collection value over time
    - Value by set, rarity, or custom tags
    - Portfolio performance charts
  - Market trends
    - Trending cards (biggest gainers/losers)
    - Set value trends
    - Market insights
- **Notifications**
  - Push notifications for sync status
  - Trade notifications
  - Price alerts

## Future Considerations

Ideas and features to explore but not yet scheduled into specific phases:

### User Roles & Permissions
- **Role hierarchy**: User (child) → Parent → Site Admin
- **Parent controls**:
  - View child's collection (read-only or full access)
  - Reset child's password
  - Undo/restore deleted cards
  - Approve friend requests
  - Set spending limits (if purchase tracking added)
- **Site admin dashboard**:
  - User management (create, delete, suspend)
  - System-wide statistics
  - Database maintenance tools
  - Audit logs
- **Implementation timing**: Likely Phase 3-4, after authentication is stable

### Other Ideas
- TBD (add ideas here as they come up)

## Performance Considerations
- Image optimization using Next.js Image component
- Lazy loading for card images
- Virtual scrolling for large collections (if needed)
- API response caching
- Debounced search inputs
- Code splitting by route

## Analytics & Tracking

### Platform: Vercel Analytics
- **Built-in analytics** from Vercel (hosting platform)
- **Privacy-friendly**: No cookies, GDPR compliant by default
- **Zero configuration**: Enable in Vercel dashboard
- **Automatic tracking**: Page views, performance metrics, traffic sources, device types

### Custom Event Tracking (Phased Approach)

#### Phase 1 (MVP) - Core Metrics
```typescript
track('card_added', { cardName, cardId, rarity, set });
track('card_deleted', { cardName, cardId });
track('search_performed', { query, resultsCount });
track('sync_completed', { itemsSynced, duration });
```
**Purpose:** Understand core collection behavior and sync reliability

#### Phase 2 - Engagement Metrics
```typescript
track('card_detail_viewed', { cardName, cardId });
track('filter_applied', { filterType, filterValue });
track('sort_changed', { sortBy });
track('user_switched', { fromUserId, toUserId });
track('stats_viewed');
```
**Purpose:** Measure feature usage and user engagement

#### Phase 3+ - Advanced Insights
```typescript
track('offline_action', { action, queuedForSync });
track('sync_conflict', { resolved });
track('api_error', { endpoint, errorType });
track('cache_hit', { cacheType, query });
track('card_edited', { cardId, field });
```
**Purpose:** Monitor offline behavior, performance, and error patterns

### Key Insights to Track
- **Collection Growth**: Cards added per week/month, most added cards
- **Search Patterns**: Popular searches, filter usage, search success rate
- **Sync Health**: Average sync time, success rate, offline usage
- **Feature Usage**: Most viewed pages, filter/sort preferences
- **Device Usage**: Chromebook vs iPad usage patterns
- **Performance**: Cache hit rates, API response times, error rates

### Implementation
```typescript
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

// lib/analytics.ts
import { track } from '@vercel/analytics';

export function trackCardAdded(card: PokemonCard) {
  track('card_added', {
    cardName: card.name,
    cardId: card.id,
    rarity: card.rarity,
    set: card.set.name
  });
}
```

## Accessibility Requirements

### Core Principles
- **Progressive Enhancement**: Everything should work without JavaScript first
  - Forms submit via standard HTML form actions
  - Links navigate using native browser behavior
  - JavaScript enhances but doesn't replace core functionality
- **Semantic HTML**: Use proper HTML elements (buttons, links, forms, headings)
- **Keyboard-first**: All interactions accessible via keyboard (Tab, Enter, Escape, Arrow keys)
- **Screen reader friendly**: Meaningful labels, announcements, and structure

### Implementation Guidelines
- **Buttons vs Links**:
  - Use `<button>` for actions (add card, delete, toggle)
  - Use `<a>` for navigation (view card, go to stats)
  - Never use `<div onClick>` or `<span onClick>`
- **Forms**:
  - Proper `<label>` for every input
  - Native form validation where possible
  - Clear error messages associated with fields
- **Focus Management**:
  - Visible focus indicators (outline, ring)
  - Logical tab order
  - Focus trapped in modals (Escape to close)
  - Focus returns to trigger element after modal closes
- **Images**:
  - Descriptive alt text for card images ("Charizard VMAX from Darkness Ablaze")
  - Decorative images use empty alt ("") or aria-hidden
- **Color & Contrast**:
  - WCAG AA compliance (4.5:1 for text, 3:1 for UI elements)
  - Don't rely on color alone (use icons + text)
  - Test in both light and dark modes
- **ARIA**:
  - Use sparingly (semantic HTML first)
  - aria-label for icon-only buttons
  - aria-live for dynamic updates (sync status, search results)
  - aria-expanded for collapsible sections

### Testing Checklist
- [ ] Navigate entire app using only keyboard
- [ ] Test with screen reader (VoiceOver on Mac/iPad, NVDA on Windows)
- [ ] Verify color contrast with browser DevTools
- [ ] Disable JavaScript and verify core functionality works
- [ ] Test with browser zoom at 200%
- [ ] Verify focus indicators are visible in all states

## Testing Strategy
- Manual testing during development
- Test on multiple devices (mobile, tablet, desktop)
- Test both light and dark modes
- Test with empty collection state
- Test with large collection (100+ cards)
- Cross-browser testing (Chrome, Safari, Firefox)

## Deployment
- **Platform**: Vercel (recommended for Next.js)
- **Domain**: TBD
- **Environment Variables**:
  - `NEXT_PUBLIC_POKEMON_TCG_API_KEY`
- **Build Command**: `npm run build`
- **Dev Command**: `npm run dev`

## Success Metrics
- Application loads in < 2 seconds
- Smooth interactions (no janky animations)
- Works offline (cached data)
- Easy to add/view cards
- Intuitive navigation
- Positive user feedback from your son!

---

**Document Version**: 1.0  
**Last Updated**: October 11, 2025  
**Status**: Approved - Ready for Implementation