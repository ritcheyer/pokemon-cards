// Pokemon TCG API client
import type { PokemonCard } from '../types';
import { getCachedCard, getCachedSearch, setCachedCard, setCachedSearch } from '../storage/localStorage';

const API_BASE_URL = 'https://api.pokemontcg.io/v2';
const API_KEY = process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY;

// API response types
interface ApiResponse<T> {
  data: T;
  page?: number;
  pageSize?: number;
  count?: number;
  totalCount?: number;
}

// Helper to build headers
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (API_KEY) {
    headers['X-Api-Key'] = API_KEY;
  }
  
  return headers;
}

// Helper to handle API errors
function handleApiError(error: unknown): never {
  if (error instanceof Error) {
    throw new Error(`Pokemon TCG API Error: ${error.message}`);
  }
  throw new Error('Pokemon TCG API Error: Unknown error occurred');
}

/**
 * Search for Pokemon cards by name
 * Results are cached for 24 hours
 */
export async function searchCards(query: string): Promise<PokemonCard[]> {
  // Check cache first
  const cached = getCachedSearch(query);
  if (cached) {
    console.log('Returning cached search results for:', query);
    return cached;
  }
  
  try {
    // For multi-word queries, use quoted exact match with wildcards
    // For single words, use simple wildcard matching
    const hasSpace = query.includes(' ');
    const searchQuery = hasSpace 
      ? `name:"*${query}*"` 
      : `name:*${query}*`;
    const url = `${API_BASE_URL}/cards?q=${encodeURIComponent(searchQuery)}&pageSize=50`;
    
    console.log('Searching Pokemon TCG API:', url);
    
    const response = await fetch(url, {
      headers: getHeaders(),
      mode: 'cors',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result: ApiResponse<PokemonCard[]> = await response.json();
    
    console.log(`Found ${result.data.length} cards for query: ${query}`);
    
    // Cache the results
    setCachedSearch(query, result.data);
    
    // Also cache individual cards
    result.data.forEach(card => setCachedCard(card));
    
    return result.data;
  } catch (error) {
    console.error('Search error details:', error);
    handleApiError(error);
  }
}

/**
 * Get a specific card by ID
 * Results are cached for 7 days
 */
export async function getCardById(cardId: string): Promise<PokemonCard> {
  // Check cache first
  const cached = getCachedCard(cardId);
  if (cached) {
    console.log('Returning cached card:', cardId);
    return cached;
  }
  
  try {
    const url = `${API_BASE_URL}/cards/${cardId}`;
    
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result: ApiResponse<PokemonCard> = await response.json();
    
    // Cache the card
    setCachedCard(result.data);
    
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Get multiple cards by IDs (batch fetch)
 */
export async function getCardsByIds(cardIds: string[]): Promise<PokemonCard[]> {
  // Check which cards are already cached
  const cachedCards: PokemonCard[] = [];
  const uncachedIds: string[] = [];
  
  cardIds.forEach(id => {
    const cached = getCachedCard(id);
    if (cached) {
      cachedCards.push(cached);
    } else {
      uncachedIds.push(id);
    }
  });
  
  // If all cards are cached, return them
  if (uncachedIds.length === 0) {
    console.log('All cards found in cache');
    return cachedCards;
  }
  
  // Fetch uncached cards
  try {
    const query = uncachedIds.map(id => `id:"${id}"`).join(' OR ');
    const url = `${API_BASE_URL}/cards?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result: ApiResponse<PokemonCard[]> = await response.json();
    
    // Cache the fetched cards
    result.data.forEach(card => setCachedCard(card));
    
    // Combine cached and fetched cards
    return [...cachedCards, ...result.data];
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Get all Pokemon types
 */
export async function getTypes(): Promise<string[]> {
  try {
    const url = `${API_BASE_URL}/types`;
    
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result: ApiResponse<string[]> = await response.json();
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Get all rarities
 */
export async function getRarities(): Promise<string[]> {
  try {
    const url = `${API_BASE_URL}/rarities`;
    
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result: ApiResponse<string[]> = await response.json();
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Get all sets
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSets(): Promise<any[]> {
  try {
    const url = `${API_BASE_URL}/sets`;
    
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: ApiResponse<any[]> = await response.json();
    return result.data;
  } catch (error) {
    handleApiError(error);
  }
}