'use client';

import { useState, useEffect } from 'react';
import { CollectionCard, PokemonCard } from '@/lib/types';
import { syncCollectionFromServer } from '@/lib/db/sync';
import { getCardsByIds } from '@/lib/api/pokemon-tcg';
import { CardItem } from './CardItem';
import { AddCardModal } from '../AddCard';
import { CardDetailModal } from '../CardDetail';
import { Spinner, EmptyState, Select } from '@/components/ui';
import styles from './CardGrid.module.css';

interface CardGridProps {
  userId: string;
}

type SortOption = 'name-asc' | 'name-desc' | 'set-asc' | 'set-desc' | 'rarity' | 'date-newest' | 'date-oldest';

export function CardGrid({ userId }: CardGridProps) {
  const [collectionCards, setCollectionCards] = useState<CollectionCard[]>([]);
  const [pokemonCards, setPokemonCards] = useState<Map<string, PokemonCard>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{ collection: CollectionCard; pokemon: PokemonCard } | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-newest');

  useEffect(() => {
    const loadCollection = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Loading collection for user:', userId);
        
        // Fetch user's collection from sync layer
        const collection = await syncCollectionFromServer(userId);
        console.log('Collection loaded:', collection.length, 'cards');
        setCollectionCards(collection);

        // Get unique card IDs
        const cardIds = [...new Set(collection.map(c => c.cardId))];
        console.log('Unique card IDs:', cardIds.length);

        if (cardIds.length > 0) {
          // Batch fetch Pokemon card data
          console.log('Fetching Pokemon card data...');
          const cards = await getCardsByIds(cardIds);
          console.log('Pokemon cards fetched:', cards.length);
          const cardMap = new Map(cards.map(card => [card.id, card]));
          setPokemonCards(cardMap);
        }
      } catch (err) {
        console.error('Failed to load collection:', err);
        setError(`Failed to load your collection: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadCollection();
    }
  }, [userId]);

  const handleCardAdded = async (newCard: CollectionCard) => {
    console.log('Card added, refreshing collection...');
    // Refresh the collection
    const collection = await syncCollectionFromServer(userId);
    setCollectionCards(collection);
    
    // Fetch the new card's Pokemon data if not already loaded
    if (!pokemonCards.has(newCard.cardId)) {
      const cards = await getCardsByIds([newCard.cardId]);
      if (cards.length > 0) {
        setPokemonCards(new Map(pokemonCards).set(newCard.cardId, cards[0]));
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Spinner text="Loading your collection..." centered />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (collectionCards.length === 0) {
    return (
      <>
        <EmptyState
          icon="🎴"
          title="No cards yet!"
          description="Search to add your first card to your collection."
          action={{
            label: "Add Card",
            onClick: () => setShowAddModal(true)
          }}
        />
        {showAddModal && (
          <AddCardModal
            userId={userId}
            onClose={() => setShowAddModal(false)}
            onCardAdded={handleCardAdded}
          />
        )}
      </>
    );
  }

  // Sort cards
  const sortedCards = [...collectionCards].sort((a, b) => {
    const cardA = pokemonCards.get(a.cardId);
    const cardB = pokemonCards.get(b.cardId);
    
    if (!cardA || !cardB) return 0;
    
    switch (sortBy) {
      case 'name-asc':
        return cardA.name.localeCompare(cardB.name);
      case 'name-desc':
        return cardB.name.localeCompare(cardA.name);
      case 'set-asc':
        return cardA.set.name.localeCompare(cardB.set.name);
      case 'set-desc':
        return cardB.set.name.localeCompare(cardA.set.name);
      case 'rarity':
        const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Ultra', 'Rare Secret'];
        const rarityA = rarityOrder.indexOf(cardA.rarity || '');
        const rarityB = rarityOrder.indexOf(cardB.rarity || '');
        return rarityB - rarityA; // Higher rarity first
      case 'date-newest':
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case 'date-oldest':
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      default:
        return 0;
    }
  });

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h2>Your Collection</h2>
            <p className={styles.count}>
              {collectionCards.length} {collectionCards.length === 1 ? 'card' : 'cards'}
            </p>
          </div>
          <div className={styles.controls}>
            <Select
              label="Sort by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="date-newest">Newest First</option>
              <option value="date-oldest">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="set-asc">Set (A-Z)</option>
              <option value="set-desc">Set (Z-A)</option>
              <option value="rarity">Rarity (High to Low)</option>
            </Select>
            <button className={styles.addButton} onClick={() => setShowAddModal(true)}>
              + Add Card
            </button>
          </div>
        </div>

      <div className={styles.grid}>
        {sortedCards.map((collectionCard) => {
          const pokemonCard = pokemonCards.get(collectionCard.cardId);
          
          if (!pokemonCard) {
            return null; // Skip if card data not loaded
          }

          return (
            <CardItem
              key={collectionCard.id}
              collectionCard={collectionCard}
              pokemonCard={pokemonCard}
              onClick={() => setSelectedCard({ collection: collectionCard, pokemon: pokemonCard })}
            />
          );
        })}
      </div>
    </div>
    
    {showAddModal && (
      <AddCardModal
        userId={userId}
        onClose={() => setShowAddModal(false)}
        onCardAdded={handleCardAdded}
      />
    )}
    
    {selectedCard && (
      <CardDetailModal
        collectionCard={selectedCard.collection}
        pokemonCard={selectedCard.pokemon}
        userId={userId}
        onClose={() => setSelectedCard(null)}
        onUpdate={async () => {
          const collection = await syncCollectionFromServer(userId);
          setCollectionCards(collection);
          // Update the selected card with the refreshed data
          const updatedCard = collection.find(c => c.id === selectedCard.collection.id);
          if (updatedCard) {
            setSelectedCard({ collection: updatedCard, pokemon: selectedCard.pokemon });
          }
        }}
        onDelete={async () => {
          const collection = await syncCollectionFromServer(userId);
          setCollectionCards(collection);
          setSelectedCard(null); // Close modal after delete
        }}
      />
    )}
  </>
  );
}
