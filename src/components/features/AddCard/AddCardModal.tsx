'use client';

import { useState, useCallback } from 'react';
import { PokemonCard, CollectionCard } from '@/lib/types';
import { searchCards } from '@/lib/api/pokemon-tcg';
import { addCardToCollection } from '@/lib/db/sync';
import { debounce } from '@/lib/utils';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { SearchResults } from './SearchResults';
import { AddCardForm } from './AddCardForm';
import styles from './AddCardModal.module.css';

interface AddCardModalProps {
  userId: string;
  onClose: () => void;
  onCardAdded: (card: CollectionCard) => void;
}

export function AddCardModal({ userId, onClose, onCardAdded }: AddCardModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PokemonCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState<CollectionCard['condition']>('near-mint');
  const [notes, setNotes] = useState('');

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      
      try {
        console.log('Searching for:', query);
        const results = await searchCards(query);
        console.log('Search results:', results.length);
        setSearchResults(results);
        setError(null);
      } catch (err) {
        console.error('Search error:', err);
        setError(`Failed to search: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500),
    []
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError(null);
    performSearch(searchQuery);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      // Don't set searching to true here - let the debounced function handle it
      performSearch(value);
    } else {
      setSearchResults([]);
      setSearching(false);
    }
  };

  const handleSelectCard = (card: PokemonCard) => {
    setSelectedCard(card);
  };

  const handleAddCard = async () => {
    if (!selectedCard) return;

    setAdding(true);
    setError(null);

    try {
      console.log('Adding card to collection:', selectedCard.name, {
        userId,
        cardId: selectedCard.id,
        quantity,
        condition,
        notes,
      });
      
      const collectionCard = await addCardToCollection(
        userId,
        selectedCard.id,
        quantity,
        condition,
        notes || undefined
      );
      
      console.log('Card added successfully:', collectionCard);
      onCardAdded(collectionCard);
      onClose();
    } catch (err) {
      console.error('Error adding card to collection:', err);
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      setError(`Failed to add card: ${errorMessage}`);
    } finally {
      setAdding(false);
    }
  };

  const handleBack = () => {
    setSelectedCard(null);
    setError(null);
    // Reset form state
    setQuantity(1);
    setCondition('near-mint');
    setNotes('');
  };

  // Close modal on escape key
  useEscapeKey(onClose);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{selectedCard ? 'Add to Collection' : 'Search for Card'}</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className={styles.content}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {!selectedCard ? (
            <>
              <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                placeholder="Search by card name (type at least 2 characters)..."
                className={styles.searchInput}
                autoFocus
              />
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className={styles.searchButton}
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </form>

            <SearchResults
              results={searchResults}
              searching={searching}
              onSelectCard={handleSelectCard}
            />
          </>
        ) : (
          <AddCardForm
            card={selectedCard}
            quantity={quantity}
            condition={condition}
            notes={notes}
            onQuantityChange={setQuantity}
            onConditionChange={setCondition}
            onNotesChange={setNotes}
            adding={adding}
          />
        )}
        </div>

        {/* Sticky Footer - Only show when card is selected */}
        {selectedCard && (
          <div className={styles.footer}>
            <button
              onClick={handleBack}
              className={styles.backButton}
              disabled={adding}
            >
              Back
            </button>
            <button
              onClick={handleAddCard}
              className={styles.addButton}
              disabled={adding}
            >
              {adding ? 'Adding...' : 'Add to Collection'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
