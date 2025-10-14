// Sync layer for localStorage <-> Supabase
import { supabase } from './supabase';
import type { User, CollectionCard, UserRow, CollectionCardRow } from '../types';
import { userRowToUser, collectionCardRowToCollectionCard, collectionCardToRow } from '../types';
// Database type imported for type annotations
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Database } from './database.types';
import {
  getCachedUsers,
  setCachedUsers,
  getCachedCollection,
  setCachedCollection,
  getPendingChanges,
  clearPendingChanges,
  addPendingChange,
  setLastSyncTime,
} from '../storage/localStorage';
import { isOnline } from '../utils';

// Sync status
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

let currentSyncStatus: SyncStatus = 'idle';
const syncListeners: Set<(status: SyncStatus) => void> = new Set();

// Subscribe to sync status changes
export function onSyncStatusChange(callback: (status: SyncStatus) => void): () => void {
  syncListeners.add(callback);
  // Return unsubscribe function
  return () => syncListeners.delete(callback);
}

function setSyncStatus(status: SyncStatus) {
  currentSyncStatus = status;
  syncListeners.forEach(listener => listener(status));
}

export function getSyncStatus(): SyncStatus {
  return currentSyncStatus;
}

// ============================================================================
// USERS SYNC
// ============================================================================

/**
 * Fetch all users from Supabase and cache locally
 */
export async function syncUsersFromServer(): Promise<User[]> {
  if (!isOnline()) {
    const cached = getCachedUsers();
    if (cached) return cached;
    throw new Error('Offline and no cached users available');
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const users = (data as UserRow[]).map(userRowToUser);
    setCachedUsers(users);
    return users;
  } catch (error) {
    console.error('Error syncing users from server:', error);
    // Return cached users if available
    const cached = getCachedUsers();
    if (cached) return cached;
    throw error;
  }
}

/**
 * Create a new user in Supabase and cache locally
 */
export async function createUser(name: string, avatar?: string): Promise<User> {
  if (!isOnline()) {
    throw new Error('Cannot create user while offline');
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('users')
      .insert({
        name,
        avatar: avatar || null,
      })
      .select()
      .single();

    if (error) throw error;

    const user = userRowToUser(data as UserRow);

    // Update cache
    const users = getCachedUsers() || [];
    users.push(user);
    setCachedUsers(users);

    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// ============================================================================
// COLLECTION SYNC
// ============================================================================

/**
 * Fetch user's collection from Supabase and cache locally
 */
export async function syncCollectionFromServer(userId: string): Promise<CollectionCard[]> {
  if (!isOnline()) {
    const cached = getCachedCollection(userId);
    if (cached) return cached;
    throw new Error('Offline and no cached collection available');
  }

  try {
    const { data, error } = await supabase
      .from('collection_cards')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw error;

    const cards = (data as CollectionCardRow[]).map(collectionCardRowToCollectionCard);
    setCachedCollection(userId, cards);
    setLastSyncTime(Date.now());
    return cards;
  } catch (error) {
    console.error('Error syncing collection from server:', error);
    // Return cached collection if available
    const cached = getCachedCollection(userId);
    if (cached) return cached;
    throw error;
  }
}

/**
 * Add a card to collection (optimistic update + sync)
 */
export async function addCardToCollection(
  userId: string,
  cardId: string,
  quantity: number,
  condition: CollectionCard['condition'],
  notes?: string
): Promise<CollectionCard> {
  const newCard: Omit<CollectionCard, 'id' | 'addedAt' | 'updatedAt'> = {
    userId,
    cardId,
    quantity,
    condition,
    notes,
  };

  // Optimistic update to cache
  const tempCard: CollectionCard = {
    ...newCard,
    id: `temp-${Date.now()}`,
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const cached = getCachedCollection(userId) || [];
  cached.unshift(tempCard);
  setCachedCollection(userId, cached);

  if (!isOnline()) {
    // Queue for later sync
    addPendingChange({ type: 'add', data: tempCard });
    return tempCard;
  }

  try {
    const rowData = collectionCardToRow(newCard);
    const { data, error } = await supabase
      .from('collection_cards')
      // @ts-expect-error - Supabase type inference issue with generated types
      .insert(rowData)
      .select()
      .single();

    if (error) throw error;

    const card = collectionCardRowToCollectionCard(data as CollectionCardRow);

    // Replace temp card with real card in cache
    const updatedCache = cached.map(c => (c.id === tempCard.id ? card : c));
    setCachedCollection(userId, updatedCache);

    return card;
  } catch (error) {
    console.error('Error adding card to collection:', error);
    // Keep optimistic update and queue for retry
    addPendingChange({ type: 'add', data: tempCard });
    throw error;
  }
}

/**
 * Update a card in collection
 */
export async function updateCardInCollection(
  userId: string,
  cardId: string,
  updates: Partial<Pick<CollectionCard, 'quantity' | 'condition' | 'notes'>>
): Promise<CollectionCard> {
  // Optimistic update to cache
  const cached = getCachedCollection(userId) || [];
  const cardIndex = cached.findIndex(c => c.id === cardId);

  if (cardIndex === -1) {
    throw new Error('Card not found in collection');
  }

  const updatedCard = { ...cached[cardIndex], ...updates };
  cached[cardIndex] = updatedCard;
  setCachedCollection(userId, cached);

  if (!isOnline()) {
    addPendingChange({ type: 'update', data: updatedCard });
    return updatedCard;
  }

  try {
    const updateData = {
      quantity: updates.quantity,
      condition: updates.condition,
      notes: updates.notes || null,
    };
    const { data, error } = await supabase
      .from('collection_cards')
      // @ts-expect-error - Supabase type inference issue with generated types
      .update(updateData)
      .eq('id', cardId)
      .select()
      .single();

    if (error) throw error;

    const card = collectionCardRowToCollectionCard(data as CollectionCardRow);

    // Update cache with server response
    cached[cardIndex] = card;
    setCachedCollection(userId, cached);

    return card;
  } catch (error) {
    console.error('Error updating card:', error);
    addPendingChange({ type: 'update', data: updatedCard });
    throw error;
  }
}

/**
 * Delete a card from collection
 */
export async function deleteCardFromCollection(
  userId: string,
  cardId: string
): Promise<void> {
  // Optimistic update to cache
  const cached = getCachedCollection(userId) || [];
  const cardToDelete = cached.find(c => c.id === cardId);
  const filteredCache = cached.filter(c => c.id !== cardId);
  setCachedCollection(userId, filteredCache);

  if (!isOnline()) {
    if (cardToDelete) {
      addPendingChange({ type: 'delete', data: cardToDelete });
    }
    return;
  }

  try {
    const { error } = await supabase
      .from('collection_cards')
      .delete()
      .eq('id', cardId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting card:', error);
    // Restore card to cache
    if (cardToDelete) {
      cached.push(cardToDelete);
      setCachedCollection(userId, cached);
      addPendingChange({ type: 'delete', data: cardToDelete });
    }
    throw error;
  }
}

/**
 * Sync pending changes to server
 */
export async function syncPendingChanges(): Promise<void> {
  if (!isOnline()) {
    setSyncStatus('offline');
    return;
  }

  const pending = getPendingChanges();
  if (pending.length === 0) {
    return;
  }

  setSyncStatus('syncing');

  try {
    for (const change of pending) {
      switch (change.type) {
        case 'add': {
          const rowData = collectionCardToRow(change.data);
          await supabase
            .from('collection_cards')
            // @ts-expect-error - Supabase type inference issue with generated types
            .insert(rowData);
          break;
        }
        case 'update': {
          const updateData = {
            quantity: change.data.quantity,
            condition: change.data.condition,
            notes: change.data.notes || null,
          };
          await supabase
            .from('collection_cards')
            // @ts-expect-error - Supabase type inference issue with generated types
            .update(updateData)
            .eq('id', change.data.id);
          break;
        }
        case 'delete':
          await supabase
            .from('collection_cards')
            .delete()
            .eq('id', change.data.id);
          break;
      }
    }

    clearPendingChanges();
    setSyncStatus('idle');
  } catch (error) {
    console.error('Error syncing pending changes:', error);
    setSyncStatus('error');
    throw error;
  }
}

/**
 * Full sync: fetch from server and sync pending changes
 */
export async function fullSync(userId: string): Promise<void> {
  if (!isOnline()) {
    setSyncStatus('offline');
    return;
  }

  setSyncStatus('syncing');

  try {
    // Sync pending changes first
    await syncPendingChanges();

    // Then fetch latest from server
    await syncUsersFromServer();
    await syncCollectionFromServer(userId);

    setSyncStatus('idle');
  } catch (error) {
    console.error('Error during full sync:', error);
    setSyncStatus('error');
    throw error;
  }
}