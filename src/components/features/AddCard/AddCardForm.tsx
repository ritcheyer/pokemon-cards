'use client';

import Image from 'next/image';
import { PokemonCard, CollectionCard } from '@/lib/types';
import styles from './AddCardForm.module.css';

interface AddCardFormProps {
  card: PokemonCard;
  quantity: number;
  condition: CollectionCard['condition'];
  notes: string;
  onQuantityChange: (quantity: number) => void;
  onConditionChange: (condition: CollectionCard['condition']) => void;
  onNotesChange: (notes: string) => void;
  adding: boolean;
}

const CONDITIONS: CollectionCard['condition'][] = [
  'mint',
  'near-mint',
  'excellent',
  'good',
  'played',
  'poor',
];

export function AddCardForm({
  card,
  quantity,
  condition,
  notes,
  onQuantityChange,
  onConditionChange,
  onNotesChange,
  adding,
}: AddCardFormProps) {
  const formatCondition = (cond: string) => {
    return cond
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className={styles.container}>
      <div className={styles.cardPreview}>
        <Image
          src={card.images.small}
          alt={`${card.name} from ${card.set.name}`}
          width={245}
          height={342}
          className={styles.image}
        />
        <div className={styles.cardInfo}>
          <h3>{card.name}</h3>
          <p className={styles.set}>{card.set.name}</p>
          {card.rarity && <p className={styles.rarity}>{card.rarity}</p>}
        </div>
      </div>

      <div className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            type="number"
            min="1"
            max="99"
            value={quantity}
            onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
            className={styles.input}
            disabled={adding}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="condition">Condition</label>
          <select
            id="condition"
            value={condition}
            onChange={(e) => onConditionChange(e.target.value as CollectionCard['condition'])}
            className={styles.select}
            disabled={adding}
          >
            {CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {formatCondition(cond)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add any notes about this card..."
            className={styles.textarea}
            rows={3}
            disabled={adding}
          />
        </div>
      </div>
    </div>
  );
}
