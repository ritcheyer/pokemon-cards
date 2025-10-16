import styles from './Spinner.module.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  centered?: boolean;
}

export function Spinner({ size = 'md', text, centered = false }: SpinnerProps) {
  const containerClass = centered ? styles.centeredContainer : styles.container;

  return (
    <div className={containerClass}>
      <div 
        className={`${styles.spinner} ${styles[size]}`}
        role="status"
        aria-label={text || 'Loading'}
      />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
}
