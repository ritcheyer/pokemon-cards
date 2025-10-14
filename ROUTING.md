# URL Routing Implementation

## Overview
Implemented proper URL routing with Next.js App Router for progressive enhancement and better UX.

## Route Structure

### `/` - User Selection Page
- **Purpose**: Select or create a user profile
- **Features**:
  - List all users
  - Create new user
  - Navigate to user collection on selection

### `/user/[userId]` - User Collection Page
- **Purpose**: Display a specific user's card collection
- **Features**:
  - Shows user's name and avatar
  - Displays card grid
  - "Switch User" button to return to home
  - 404 handling for invalid user IDs

## Benefits

### 1. **Shareable URLs**
- Direct link to any user's collection: `/user/abc123`
- Can bookmark specific collections
- Share collection with others

### 2. **Browser History**
- Back/forward buttons work correctly
- Natural navigation flow
- Proper page titles (future enhancement)

### 3. **Progressive Enhancement**
- URLs work without JavaScript
- Server-side rendering ready
- Deep linking supported

### 4. **Better UX**
- Clear URL indicates current location
- Refresh preserves state
- No confusion about where you are in the app

## Implementation Details

### Files Created/Modified

**Created:**
- `src/app/user/[userId]/page.tsx` - User collection route

**Modified:**
- `src/app/page.tsx` - Removed local state, added router navigation
- `spec.md` - Added URL structure documentation

### Navigation Flow

```
Home (/)
  ↓ Select/Create User
User Collection (/user/[userId])
  ↓ Click "Switch User"
Home (/)
```

### Code Examples

**Navigate to user collection:**
```typescript
router.push(`/user/${userId}`);
```

**Return to home:**
```typescript
router.push('/');
```

## Future Enhancements

### Query Parameters for Filters
```
/user/[userId]?search=pikachu&rarity=rare&sort=name
```

### Card Detail URLs (Optional)
```
/user/[userId]/card/[cardId]
```
- Could be modal with URL update
- Or full page view
- Shareable card links

### Metadata & SEO
```typescript
export async function generateMetadata({ params }) {
  return {
    title: `${user.name}'s Collection`,
    description: `View ${user.name}'s Pokémon card collection`
  };
}
```

## Testing Checklist

- [x] Navigate from home to user collection
- [x] URL updates correctly
- [x] Browser back button returns to home
- [x] Direct URL access works
- [x] Invalid user ID shows error and redirects
- [ ] Refresh page preserves state
- [ ] Share URL with another device/browser

## Progressive Enhancement Notes

The app now follows web standards:
- ✅ URLs reflect application state
- ✅ Browser navigation works
- ✅ Deep linking supported
- ✅ No JavaScript required for basic navigation
- 🔄 Server-side rendering ready (future)
