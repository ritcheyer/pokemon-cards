import React from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders spinner with default props', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders spinner with custom text', () => {
    render(<Spinner text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading data...');
  });

  it('renders spinner without text when not provided', () => {
    const { container } = render(<Spinner />);
    const textElement = container.querySelector('p');
    expect(textElement).not.toBeInTheDocument();
  });

  it('applies small size class', () => {
    render(<Spinner size="sm" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('sm');
  });

  it('applies medium size class by default', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('md');
  });

  it('applies large size class', () => {
    render(<Spinner size="lg" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('lg');
  });

  it('renders with centered container when centered prop is true', () => {
    const { container } = render(<Spinner centered />);
    const spinnerContainer = container.firstChild;
    expect(spinnerContainer).toHaveClass('centeredContainer');
  });

  it('renders with regular container when centered prop is false', () => {
    const { container } = render(<Spinner centered={false} />);
    const spinnerContainer = container.firstChild;
    expect(spinnerContainer).toHaveClass('container');
  });

  it('renders with all props combined', () => {
    render(<Spinner size="lg" text="Please wait..." centered />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('lg');
    expect(spinner).toHaveAttribute('aria-label', 'Please wait...');
    
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
    
    const { container } = render(<Spinner size="lg" text="Please wait..." centered />);
    expect(container.firstChild).toHaveClass('centeredContainer');
  });
});
