# CSS Modules Issue with Tailwind v4

## Problem

The shared UI components in `src/components/ui/` are failing to compile with the error:

```
CssSyntaxError: tailwindcss: Cannot apply unknown utility class `px-4`
```

## What We Know

1. **Feature components work**: `src/components/features/` CSS modules compile fine
2. **Same syntax**: Both use `@reference "../../../app/globals.css";`
3. **Byte-for-byte identical**: The `@reference` directive is exactly the same
4. **Path is correct**: `../../../app/globals.css` resolves correctly from both locations

## What We Tried

1. ❌ `@import "tailwindcss"` - Caused "Selector * is not pure" error
2. ❌ `@import "tailwindcss/utilities"` - Still couldn't find utilities
3. ❌ `@import "tailwindcss" reference` - Same error
4. ❌ `@reference "tailwindcss"` - Utilities not found (even though docs say it should work)
5. ❌ `@reference "tailwindcss/utilities"` - Utilities not found
6. ✅ `@reference "../../../app/globals.css"` - Should work but doesn't for ui components

## Current State

- **Working**: `src/components/features/*/` CSS modules
- **Broken**: `src/components/ui/*/` CSS modules
- **Syntax**: Both use identical `@reference` directives

## Possible Causes

1. **Build order**: UI components might be processed before globals.css is loaded
2. **Import path**: Barrel exports in `src/components/ui/index.ts` might affect CSS processing
3. **Turbopack cache**: Despite clearing `.next`, there might be cached state
4. **Next.js 15.5.4 + Tailwind v4 bug**: Known compatibility issues

## Next Steps

1. Try converting CSS modules to inline Tailwind classes
2. Try removing barrel exports and importing components directly
3. Check if there's a Next.js/Tailwind v4 compatibility patch
4. Consider downgrading to Tailwind v3 if issue persists

## Environment

- Next.js: 15.5.4
- Tailwind CSS: v4 (`@tailwindcss/postcss": "^4"`)
- Build tool: Turbopack
