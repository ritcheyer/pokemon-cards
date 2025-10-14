import { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  flex?: boolean;
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  flex = true,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: styles.primary,
    secondary: styles.secondary,
    danger: styles.danger,
  }[variant];

  let widthClass = '';
  if (fullWidth) {
    widthClass = styles.fullWidth;
  } else if (flex) {
    widthClass = styles.flexOne;
  }

  return (
    <button
      className={`${styles.button} ${variantClass} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
