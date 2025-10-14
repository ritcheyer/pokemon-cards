import { ReactNode } from 'react';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import styles from './Modal.module.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'lg',
}: ModalProps) {
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: styles.maxWidthSm,
    md: styles.maxWidthMd,
    lg: styles.maxWidthLg,
    xl: styles.maxWidthXl,
    '2xl': styles.maxWidth2xl,
    '4xl': styles.maxWidth4xl,
  }[maxWidth];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${maxWidthClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2>{title}</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>{children}</div>

        {/* Footer */}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
