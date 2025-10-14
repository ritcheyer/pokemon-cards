import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

describe('Select', () => {
  const options = (
    <>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </>
  );

  it('renders with label', () => {
    render(<Select label="Choose option">{options}</Select>);
    expect(screen.getByLabelText(/choose option/i)).toBeInTheDocument();
  });

  it('renders without label when not provided', () => {
    render(<Select>{options}</Select>);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select>{options}</Select>);
    expect(screen.getByRole('option', { name: /option 1/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /option 2/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /option 3/i })).toBeInTheDocument();
  });

  it('handles selection change', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Select onChange={handleChange}>{options}</Select>);
    const select = screen.getByRole('combobox');
    
    await user.selectOptions(select, '2');
    
    expect(handleChange).toHaveBeenCalled();
    expect(select).toHaveValue('2');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Select disabled>{options}</Select>);
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('displays error message when provided', () => {
    render(<Select label="Status" error="Please select an option">{options}</Select>);
    expect(screen.getByText(/please select an option/i)).toBeInTheDocument();
  });

  it('displays error styling when error is present', () => {
    render(<Select error="Error message">{options}</Select>);
    const errorText = screen.getByText(/error message/i);
    expect(errorText).toBeInTheDocument();
    expect(errorText).toHaveClass('error');
  });

  it('supports controlled component pattern', async () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('1');
      return (
        <Select 
          value={value} 
          onChange={(e) => setValue(e.target.value)}
          data-testid="controlled-select"
        >
          {options}
        </Select>
      );
    };

    const user = userEvent.setup();
    render(<TestComponent />);
    const select = screen.getByTestId('controlled-select');
    
    expect(select).toHaveValue('1');
    await user.selectOptions(select, '3');
    expect(select).toHaveValue('3');
  });

  it('forwards additional props', () => {
    render(<Select data-testid="custom-select" name="status">{options}</Select>);
    const select = screen.getByTestId('custom-select');
    expect(select).toHaveAttribute('name', 'status');
  });
});
