import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders with label', () => {
    render(<Textarea label="Description" />);
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('renders without label when not provided', () => {
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    render(<Textarea placeholder="Enter description" />);
    expect(screen.getByPlaceholderText(/enter description/i)).toBeInTheDocument();
  });

  it('handles text input', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Textarea onChange={handleChange} />);
    const textarea = screen.getByRole('textbox');
    
    await user.type(textarea, 'Multi-line\ntext');
    
    expect(handleChange).toHaveBeenCalled();
    expect(textarea).toHaveValue('Multi-line\ntext');
  });

  it('respects rows attribute', () => {
    render(<Textarea rows={5} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('displays error message when provided', () => {
    render(<Textarea label="Notes" error="Notes are required" />);
    expect(screen.getByText(/notes are required/i)).toBeInTheDocument();
  });

  it('displays error styling when error is present', () => {
    render(<Textarea error="Error message" />);
    const errorText = screen.getByText(/error message/i);
    expect(errorText).toBeInTheDocument();
    expect(errorText).toHaveClass('error');
  });

  it('supports controlled component pattern', async () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('');
      return (
        <Textarea 
          value={value} 
          onChange={(e) => setValue(e.target.value)}
          data-testid="controlled-textarea"
        />
      );
    };

    const user = userEvent.setup();
    render(<TestComponent />);
    const textarea = screen.getByTestId('controlled-textarea');
    
    await user.type(textarea, 'test content');
    expect(textarea).toHaveValue('test content');
  });

  it('forwards additional props', () => {
    render(<Textarea data-testid="custom-textarea" maxLength={100} />);
    const textarea = screen.getByTestId('custom-textarea');
    expect(textarea).toHaveAttribute('maxLength', '100');
  });
});
