# Additional Refactoring Opportunities

## High Priority

### 1. **Duplicate Constants** ⭐⭐⭐

#### CONDITIONS Array (Duplicated 3x)
**Found in:**
- `CardDetailModal.tsx`
- `AddCardForm.tsx`
- `CardDetailModal.tsx.backup` (can delete)

**Current:**
```typescript
const CONDITIONS: CollectionCard['condition'][] = [
  'mint',
  'near-mint',
  'excellent',
  'good',
  'played',
  'poor',
];
```

**Solution:**
Create `src/lib/constants.ts`:
```typescript
export const CARD_CONDITIONS = [
  'mint',
  'near-mint',
  'excellent',
  'good',
  'played',
  'poor',
] as const;

export type CardCondition = typeof CARD_CONDITIONS[number];
```

**Benefits:**
- Single source of truth
- Easy to add/remove conditions
- Type-safe
- ~18 lines of code removed

---

#### formatCondition Function (Duplicated 2x + utility)
**Found in:**
- `CardItem.tsx` (local function)
- `AddCardForm.tsx` (local function)
- `lib/utils.ts` (already exists!)

**Current (duplicated):**
```typescript
const formatCondition = (cond: string) => {
  return cond
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
```

**Solution:**
Remove local functions, import from `lib/utils.ts`:
```typescript
import { formatCondition } from '@/lib/utils';
```

**Benefits:**
- Already exists in utils!
- Remove ~10 lines per file
- Consistent formatting

---

### 2. **Inline Button/Input Styles in page.tsx** ⭐⭐⭐

**Found in:**
- `app/page.tsx` - Create user modal
- `app/user/[userId]/page.tsx` - Switch User button

**Current:**
```tsx
<button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
```

**Solution:**
Use shared `Button` and `Input` components:
```tsx
import { Button, Input } from '@/components/ui';

<Input
  label="Name"
  value={newUserName}
  onChange={(e) => setNewUserName(e.target.value)}
  placeholder="Enter your name"
  disabled={loading}
/>

<Button variant="secondary" onClick={handleCancel} disabled={loading}>
  Cancel
</Button>

<Button variant="primary" type="submit" disabled={loading || !newUserName.trim()}>
  {loading ? 'Creating...' : 'Create'}
</Button>
```

**Benefits:**
- Consistent with rest of app
- Cleaner code
- Easier to maintain
- ~50 lines of inline styles removed

---

### 3. **Modal Structure Duplication** ⭐⭐

**Found in:**
- `AddCardModal.tsx` - Custom modal structure
- `CardDetailModal.tsx` - Custom modal structure

**Current:**
Both have:
```tsx
<div className={styles.overlay} onClick={onClose}>
  <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
    <div className={styles.header}>
      <h2>{title}</h2>
      <button onClick={onClose} className={styles.closeButton}>×</button>
    </div>
    <div className={styles.content}>{children}</div>
    <div className={styles.footer}>{footer}</div>
  </div>
</div>
```

**Solution:**
We already created `Modal` component! Use it:
```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={true}
  onClose={onClose}
  title="Card Details"
  maxWidth="4xl"
  footer={
    <>
      <Button variant="danger" onClick={handleDelete}>Delete</Button>
      <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit</Button>
    </>
  }
>
  {/* content */}
</Modal>
```

**Benefits:**
- Remove ~30 lines per modal
- Consistent modal behavior
- Built-in escape key handling
- Cleaner component code

---

## Medium Priority

### 4. **Error Display Pattern** ⭐⭐

**Found in:**
- `AddCardModal.tsx`
- `CardDetailModal.tsx`
- `app/page.tsx`

**Current:**
```tsx
{error && (
  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
    {error}
  </div>
)}
```

**Solution:**
Create `Alert` component:
```tsx
// src/components/ui/Alert/Alert.tsx
<Alert variant="error">{error}</Alert>
<Alert variant="success">{message}</Alert>
<Alert variant="warning">{warning}</Alert>
```

**Benefits:**
- Consistent error/success messaging
- Easy to add icons
- Reusable across app

---

### 5. **Loading Spinner Pattern** ⭐⭐

**Found in:**
- `app/page.tsx`
- `app/user/[userId]/page.tsx`
- `SearchResults.tsx`

**Current:**
```tsx
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
```

**Solution:**
Create `Spinner` component:
```tsx
// src/components/ui/Spinner/Spinner.tsx
<Spinner size="sm" | "md" | "lg" />
```

**Benefits:**
- Consistent loading states
- Easy to customize
- Reusable

---

### 6. **Avatar/User Icon Pattern** ⭐

**Found in:**
- `app/page.tsx` (user list)
- `app/user/[userId]/page.tsx` (header)

**Current:**
```tsx
<div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
  {user.name.charAt(0).toUpperCase()}
</div>
```

**Solution:**
Create `Avatar` component:
```tsx
// src/components/ui/Avatar/Avatar.tsx
<Avatar name={user.name} size="md" />
```

**Benefits:**
- Consistent user representation
- Easy to add images later
- Reusable

---

## Low Priority

### 7. **Backup File Cleanup** ⭐

**Found:**
- `CardDetailModal.tsx.backup`

**Solution:**
Delete it - we have git history

---

### 8. **Card Display Logic** ⭐

**Found in:**
- `CardItem.tsx` - Card preview
- `AddCardForm.tsx` - Card preview
- `CardDetailModal.tsx` - Card display

**Observation:**
Similar card display patterns, but different enough that extraction might not be worth it yet.

**Recommendation:**
Wait until we have 3+ identical patterns before extracting.

---

## Implementation Priority

### Phase 1: Quick Wins (30 min)
1. ✅ Delete `CardDetailModal.tsx.backup`
2. ✅ Extract CONDITIONS constant
3. ✅ Remove duplicate formatCondition functions
4. ✅ Migrate page.tsx to use Button/Input components

### Phase 2: Modal Refactor (1 hour)
1. ✅ Migrate AddCardModal to use Modal component
2. ✅ Migrate CardDetailModal to use Modal component
3. ✅ Remove duplicate modal CSS

### Phase 3: New Components (1-2 hours)
1. ✅ Create Alert component
2. ✅ Create Spinner component
3. ✅ Create Avatar component
4. ✅ Migrate existing usage

---

## Estimated Impact

### Code Reduction
- **Constants extraction**: ~30 lines
- **formatCondition cleanup**: ~20 lines
- **page.tsx migration**: ~50 lines
- **Modal migration**: ~60 lines
- **Total**: ~160 lines removed

### New Components
- Alert: ~30 lines
- Spinner: ~20 lines
- Avatar: ~40 lines
- **Total**: ~90 lines added

### Net Result
- **~70 lines net reduction**
- **Much more maintainable**
- **Consistent patterns throughout**

---

## Recommendation

**Do Phase 1 now** (quick wins, low risk):
1. Delete backup file
2. Extract constants
3. Clean up formatCondition
4. Migrate page.tsx buttons/inputs

**Do Phase 2 & 3 later** (when adding new features):
- Modal migration can wait
- Alert/Spinner/Avatar can be added as needed

This approach balances immediate improvement with not over-engineering.
