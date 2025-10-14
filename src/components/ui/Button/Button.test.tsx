import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('primary');
  });

  it('applies secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('secondary');
  });

  it('applies danger variant', () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('danger');
  });

  it('applies flex-1 class by default', () => {
    render(<Button>Flex Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('flexOne');
  });

  it('does not apply flex class when flex is false', () => {
    render(<Button flex={false}>No Flex</Button>);
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('flexOne');
  });

  it('applies fullWidth class when fullWidth is true', () => {
    render(<Button fullWidth>Full Width</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('fullWidth');
  });

  it('handles onClick events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick} disabled>Disabled</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('forwards additional props', () => {
    render(<Button type="submit" data-testid="custom-button">Submit</Button>);
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});
