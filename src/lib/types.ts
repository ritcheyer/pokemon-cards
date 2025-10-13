// Type definitions for Pokemon Card Collection

// User model
export interface User {
  id: string;
  name: string;
  createdAt: string;
  avatar?: string;
}

// Pokemon Card from TCG API
export interface PokemonCard {
  id: string; // API card ID
  name: string;
  supertype: string; // Pokémon, Trainer, Energy
  subtypes: string[]; // Stage 1, Basic, etc.
  hp?: string;
  types?: string[]; // Fire, Water, Grass, etc.
  rarity?: string; // Common, Uncommon, Rare, etc.
  number?: string; // Card number in set
  artist?: string; // Card artist
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
  attacks?: Array<{
    name: string;
    cost: string[];
    convertedEnergyCost: number;
    damage: string;
    text: string;
  }>;
  abilities?: Array<{
    name: string;
    text: string;
    type: string;
  }>;
}

// Collection card (user's owned card)
export interface CollectionCard {
  id: string; // Unique collection entry ID
  userId: string; // Owner reference
  cardId: string; // Pokemon TCG API card ID
  quantity: number;
  condition: CardCondition;
  addedAt: string; // ISO date string
  updatedAt: string; // ISO date string
  notes?: string;
}

// Card condition enum
export type CardCondition =
  | 'mint'
  | 'near-mint'
  | 'excellent'
  | 'good'
  | 'played'
  | 'poor';

// Combined type for display (collection card + Pokemon card data)
export interface CollectionCardWithData extends CollectionCard {
  card: PokemonCard;
}

// Database row types (snake_case from Supabase)
export interface UserRow {
  id: string;
  name: string;
  created_at: string;
  avatar: string | null;
}

export interface CollectionCardRow {
  id: string;
  user_id: string;
  card_id: string;
  quantity: number;
  condition: CardCondition;
  added_at: string;
  updated_at: string;
  notes: string | null;
}

// Helper to convert database row to app model
export function userRowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    avatar: row.avatar || undefined,
  };
}

export function collectionCardRowToCollectionCard(
  row: CollectionCardRow
): CollectionCard {
  return {
    id: row.id,
    userId: row.user_id,
    cardId: row.card_id,
    quantity: row.quantity,
    condition: row.condition,
    addedAt: row.added_at,
    updatedAt: row.updated_at,
    notes: row.notes || undefined,
  };
}

// Helper to convert app model to database row
export function collectionCardToRow(
  card: Omit<CollectionCard, 'id' | 'addedAt' | 'updatedAt'>
): Omit<CollectionCardRow, 'id' | 'added_at' | 'updated_at'> {
  return {
    user_id: card.userId,
    card_id: card.cardId,
    quantity: card.quantity,
    condition: card.condition,
    notes: card.notes || null,
  };
}