'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CollectionCard, PokemonCard } from '@/lib/types';
import { updateCardInCollection, deleteCardFromCollection } from '@/lib/db/sync';
import { formatCondition } from '@/lib/utils';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import styles from './CardDetailModal.module.css';

interface CardDetailModalProps {
  collectionCard: CollectionCard;
  pokemonCard: PokemonCard;
  userId: string;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

const CONDITIONS: CollectionCard['condition'][] = [
  'mint',
  'near-mint',
  'excellent',
  'good',
  'played',
  'poor',
];

export function CardDetailModal({
  collectionCard,
  pokemonCard,
  userId,
  onClose,
  onUpdate,
  onDelete,
}: CardDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(collectionCard.quantity);
  const [condition, setCondition] = useState(collectionCard.condition);
  const [notes, setNotes] = useState(collectionCard.notes || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      await updateCardInCollection(userId, collectionCard.id, {
        quantity,
        condition,
        notes: notes || undefined,
      });
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      console.error('Error updating card:', err);
      setError('Failed to update card. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this card from your collection?')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await deleteCardFromCollection(userId, collectionCard.id);
      onDelete();
      onClose();
    } catch (err) {
      console.error('Error deleting card:', err);
      setError('Failed to delete card. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setQuantity(collectionCard.quantity);
    setCondition(collectionCard.condition);
    setNotes(collectionCard.notes || '');
    setIsEditing(false);
    setError(null);
  };

  // Close modal on escape key (but not when editing to avoid accidental closes)
  useEscapeKey(onClose, !isEditing);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2>{pokemonCard.name}</h2>
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

          <div className={styles.cardDisplay}>
            {/* Card Image */}
            <div className={styles.imageSection}>
              <Image
                src={pokemonCard.images.large}
                alt={`${pokemonCard.name} from ${pokemonCard.set.name}`}
                width={367}
                height={512}
                className={styles.cardImage}
                priority
              />
            </div>

            {/* Card Info */}
            <div className={styles.infoSection}>
              <div className={styles.infoGroup}>
                <h3>Card Details</h3>
                <dl className={styles.detailsList}>
                  <dt>Set</dt>
                  <dd>{pokemonCard.set.name}</dd>
                  
                  {pokemonCard.rarity && (
                    <>
                      <dt>Rarity</dt>
                      <dd>{pokemonCard.rarity}</dd>
                    </>
                  )}
                  
                  {pokemonCard.number && (
                    <>
                      <dt>Card Number</dt>
                      <dd>{pokemonCard.number}</dd>
                    </>
                  )}
                  
                  {pokemonCard.artist && (
                    <>
                      <dt>Artist</dt>
                      <dd>{pokemonCard.artist}</dd>
                    </>
                  )}
                </dl>
              </div>

              <div className={styles.infoGroup}>
                <h3>Collection Info</h3>
                {isEditing ? (
                  <div className={styles.editForm}>
                    <div className={styles.field}>
                      <label htmlFor="edit-quantity">Quantity</label>
                      <input
                        id="edit-quantity"
                        type="number"
                        min="1"
                        max="99"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="edit-condition">Condition</label>
                      <select
                        id="edit-condition"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value as CollectionCard['condition'])}
                        className={styles.select}
                      >
                        {CONDITIONS.map((cond) => (
                          <option key={cond} value={cond}>
                            {formatCondition(cond)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="edit-notes">Notes</label>
                      <textarea
                        id="edit-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes..."
                        className={styles.textarea}
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <dl className={styles.detailsList}>
                      <dt>Quantity</dt>
                      <dd>{collectionCard.quantity}</dd>
                      
                      <dt>Condition</dt>
                      <dd>{formatCondition(collectionCard.condition)}</dd>
                    </dl>
                    
                    {collectionCard.notes && (
                      <div className={styles.notesDisplay}>
                        <h4>Notes</h4>
                        <p>{collectionCard.notes}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className={styles.footer}>
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className={styles.cancelButton}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={styles.saveButton}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleDelete}
                className={styles.deleteButton}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className={styles.editButton}
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
