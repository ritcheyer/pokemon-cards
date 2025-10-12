// localStorage utilities for offline caching
import type { CollectionCard, PokemonCard, User } from '../types';

// Storage keys
const KEYS = {
  USERS: 'pokemon-cards:users',
  COLLECTION: 'pokemon-cards:collection',
  SEARCH_CACHE: 'pokemon-cards:search',
  CARD_CACHE: 'pokemon-cards:card',
  THEME: 'pokemon-cards:theme',
  LAST_SYNC: 'pokemon-cards:last-sync',
  PENDING_CHANGES: 'pokemon-cards:pending-changes',
} as const;

// Cache expiration times (in milliseconds)
const CACHE_DURATION = {
  SEARCH: 24 * 60 * 60 * 1000, // 24 hours
  CARD: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

interface CachedData<T> {
  data: T;
  timestamp: number;
}

// Generic localStorage helpers
function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

// Check if cached data is still valid
function isCacheValid(timestamp: number, duration: number): boolean {
  return Date.now() - timestamp < duration;
}

// Users
export function getCachedUsers(): User[] | null {
  return getItem<User[]>(KEYS.USERS);
}

export function setCachedUsers(users: User[]): void {
  setItem(KEYS.USERS, users);
}

// Collection
export function getCachedCollection(userId: string): CollectionCard[] | null {
  const allCollections = getItem<Record<string, CollectionCard[]>>(KEYS.COLLECTION);
  return allCollections?.[userId] || null;
}

export function setCachedCollection(userId: string, cards: CollectionCard[]): void {
  const allCollections = getItem<Record<string, CollectionCard[]>>(KEYS.COLLECTION) || {};
  allCollections[userId] = cards;
  setItem(KEYS.COLLECTION, allCollections);
}

// Search results cache
export function getCachedSearch(query: string): PokemonCard[] | null {
  const cacheKey = `${KEYS.SEARCH_CACHE}:${query.toLowerCase()}`;
  const cached = getItem<CachedData<PokemonCard[]>>(cacheKey);
  
  if (!cached) return null;
  
  if (isCacheValid(cached.timestamp, CACHE_DURATION.SEARCH)) {
    return cached.data;
  }
  
  // Cache expired, remove it
  removeItem(cacheKey);
  return null;
}

export function setCachedSearch(query: string, results: PokemonCard[]): void {
  const cacheKey = `${KEYS.SEARCH_CACHE}:${query.toLowerCase()}`;
  setItem(cacheKey, {
    data: results,
    timestamp: Date.now(),
  });
}

// Individual card cache
export function getCachedCard(cardId: string): PokemonCard | null {
  const cacheKey = `${KEYS.CARD_CACHE}:${cardId}`;
  const cached = getItem<CachedData<PokemonCard>>(cacheKey);
  
  if (!cached) return null;
  
  if (isCacheValid(cached.timestamp, CACHE_DURATION.CARD)) {
    return cached.data;
  }
  
  // Cache expired, remove it
  removeItem(cacheKey);
  return null;
}

export function setCachedCard(card: PokemonCard): void {
  const cacheKey = `${KEYS.CARD_CACHE}:${card.id}`;
  setItem(cacheKey, {
    data: card,
    timestamp: Date.now(),
  });
}

// Theme preference
export function getThemePreference(): 'light' | 'dark' | null {
  return getItem<'light' | 'dark'>(KEYS.THEME);
}

export function setThemePreference(theme: 'light' | 'dark'): void {
  setItem(KEYS.THEME, theme);
}

// Last sync timestamp
export function getLastSyncTime(): number | null {
  return getItem<number>(KEYS.LAST_SYNC);
}

export function setLastSyncTime(timestamp: number): void {
  setItem(KEYS.LAST_SYNC, timestamp);
}

// Pending changes (for offline mode)
interface PendingChange {
  id: string;
  type: 'add' | 'update' | 'delete';
  data: CollectionCard;
  timestamp: number;
}

export function getPendingChanges(): PendingChange[] {
  return getItem<PendingChange[]>(KEYS.PENDING_CHANGES) || [];
}

export function addPendingChange(change: Omit<PendingChange, 'id' | 'timestamp'>): void {
  const changes = getPendingChanges();
  changes.push({
    ...change,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  });
  setItem(KEYS.PENDING_CHANGES, changes);
}

export function clearPendingChanges(): void {
  removeItem(KEYS.PENDING_CHANGES);
}

// Clear all cache (useful for debugging)
export function clearAllCache(): void {
  Object.values(KEYS).forEach(key => {
    if (key.includes(':')) {
      // For prefixed keys, we need to iterate through all localStorage keys
      const prefix = key.split(':')[0];
      Object.keys(localStorage)
        .filter(k => k.startsWith(prefix))
        .forEach(k => removeItem(k));
    } else {
      removeItem(key);
    }
  });
}