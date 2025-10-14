import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  });

  it('renders without label when not provided', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
  });

  it('handles text input', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'Hello');
    
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('Hello');
  });

  it('handles number input', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Input type="number" onChange={handleChange} />);
    const input = screen.getByRole('spinbutton');
    
    await user.type(input, '42');
    
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue(42);
  });

  it('respects min and max for number inputs', () => {
    render(<Input type="number" min="1" max="10" />);
    const input = screen.getByRole('spinbutton');
    
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('max', '10');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('displays error message when provided', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  it('displays error styling when error is present', () => {
    const { container } = render(<Input error="Error message" />);
    const errorText = screen.getByText(/error message/i);
    expect(errorText).toBeInTheDocument();
    expect(errorText).toHaveClass('error');
  });

  it('forwards additional props', () => {
    render(<Input data-testid="custom-input" maxLength={10} />);
    const input = screen.getByTestId('custom-input');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('supports controlled component pattern', async () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('');
      return (
        <Input 
          value={value} 
          onChange={(e) => setValue(e.target.value)}
          data-testid="controlled-input"
        />
      );
    };

    const user = userEvent.setup();
    render(<TestComponent />);
    const input = screen.getByTestId('controlled-input');
    
    await user.type(input, 'test');
    expect(input).toHaveValue('test');
  });
});
