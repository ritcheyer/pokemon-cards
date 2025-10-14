'use client';

import Image from 'next/image';
import { PokemonCard, CollectionCard } from '@/lib/types';
import { formatCondition } from '@/lib/utils';
import { CARD_CONDITIONS } from '@/lib/constants';
import { Input, Select, Textarea } from '@/components/ui';
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
        <Input
          label="Quantity"
          type="number"
          min="1"
          max="99"
          value={quantity}
          onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
          disabled={adding}
        />

        <Select
          label="Condition"
          value={condition}
          onChange={(e) => onConditionChange(e.target.value as CollectionCard['condition'])}
          disabled={adding}
        >
          {CARD_CONDITIONS.map((cond) => (
            <option key={cond} value={cond}>
              {formatCondition(cond)}
            </option>
          ))}
        </Select>

        <Textarea
          label="Notes (optional)"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add any notes about this card..."
          rows={3}
          disabled={adding}
        />
      </div>
    </div>
  );
}
