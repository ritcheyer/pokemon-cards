'use client';

import Image from 'next/image';
import { PokemonCard } from '@/lib/types';
import { Spinner, EmptyState } from '@/components/ui';
import styles from './SearchResults.module.css';

interface SearchResultsProps {
  results: PokemonCard[];
  searching: boolean;
  onSelectCard: (card: PokemonCard) => void;
}

export function SearchResults({ results, searching, onSelectCard }: SearchResultsProps) {
  if (searching) {
    return (
      <div className={styles.loadingState}>
        <Spinner text="Searching for cards..." centered />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="No results yet"
        description="Try searching for a card!"
      />
    );
  }

  return (
    <div className={styles.container}>
      <p className={styles.resultCount}>
        Found {results.length} card{results.length !== 1 ? 's' : ''}
      </p>
      <div className={styles.grid}>
        {results.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelectCard(card)}
            className={styles.resultCard}
          >
            <div className={styles.imageContainer}>
              <Image
                src={card.images.small}
                alt={`${card.name} from ${card.set.name}`}
                width={245}
                height={342}
                loading="lazy"
                className={styles.image}
              />
            </div>
            <div className={styles.info}>
              <h3 className={styles.name}>{card.name}</h3>
              <p className={styles.set}>{card.set.name}</p>
              {card.rarity && <p className={styles.rarity}>{card.rarity}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
