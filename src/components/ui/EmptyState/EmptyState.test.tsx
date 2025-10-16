import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders with title only', () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders with title and description', () => {
    render(
      <EmptyState
        title="No items found"
        description="Try adding some items to get started."
      />
    );
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Try adding some items to get started.')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    const { container } = render(
      <EmptyState
        icon="🎴"
        title="No cards"
      />
    );
    expect(container.textContent).toContain('🎴');
  });

  it('renders with custom icon component', () => {
    render(
      <EmptyState
        icon={<span data-testid="custom-icon">Custom Icon</span>}
        title="No items"
      />
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const handleClick = jest.fn();
    render(
      <EmptyState
        title="No items"
        action={{
          label: "Add Item",
          onClick: handleClick
        }}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Add Item' });
    expect(button).toBeInTheDocument();
  });

  it('calls action onClick when button is clicked', () => {
    const handleClick = jest.fn();
    render(
      <EmptyState
        title="No items"
        action={{
          label: "Add Item",
          onClick: handleClick
        }}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Add Item' });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when not provided', () => {
    render(<EmptyState title="No items" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="No items" />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(0);
  });

  it('does not render icon when not provided', () => {
    const { container } = render(<EmptyState title="No items" />);
    const iconDiv = container.querySelector('[class*="icon"]');
    expect(iconDiv).not.toBeInTheDocument();
  });

  it('renders with all props combined', () => {
    const handleClick = jest.fn();
    render(
      <EmptyState
        icon="🎴"
        title="No cards yet!"
        description="Search to add your first card."
        action={{
          label: "Add Card",
          onClick: handleClick
        }}
      />
    );
    
    expect(screen.getByText('No cards yet!')).toBeInTheDocument();
    expect(screen.getByText('Search to add your first card.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Card' })).toBeInTheDocument();
  });
});
