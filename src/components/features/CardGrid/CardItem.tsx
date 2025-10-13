'use client';

import Image from 'next/image';
import { CollectionCard, PokemonCard } from '@/lib/types';
import styles from './CardItem.module.css';

interface CardItemProps {
  collectionCard: CollectionCard;
  pokemonCard: PokemonCard;
  onClick?: () => void;
}

export function CardItem({ collectionCard, pokemonCard, onClick }: CardItemProps) {
  const { quantity, condition } = collectionCard;
  const { name, images, set, rarity } = pokemonCard;

  // Format condition for display
  const formatCondition = (cond: string) => {
    return cond
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className={styles.card} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.imageContainer}>
        <Image
          src={images.small}
          alt={`${name} from ${set.name}`}
          width={245}
          height={342}
          loading="lazy"
          className={styles.image}
        />
        
        {quantity > 1 && (
          <div className={styles.quantityBadge} aria-label={`Quantity: ${quantity}`}>
            ×{quantity}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        
        <div className={styles.meta}>
          <span className={styles.set}>{set.name}</span>
          {rarity && <span className={styles.rarity}>{rarity}</span>}
        </div>

        <div className={styles.condition}>
          <span className={styles.conditionLabel}>Condition:</span>
          <span className={styles.conditionValue}>{formatCondition(condition)}</span>
        </div>
      </div>
    </div>
  );
}
