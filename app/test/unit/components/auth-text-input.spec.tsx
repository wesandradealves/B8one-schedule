import { render, screen } from '@testing-library/react';
import { AuthTextInput } from '@/components/atoms/auth-text-input';

describe('AuthTextInput', () => {
  it('should render default input styling without left icon', () => {
    render(<AuthTextInput aria-label="input-default" />);

    const input = screen.getByLabelText('input-default');
    expect(input).toHaveClass('px-3');
    expect(input).toHaveClass('border-slate-200');
  });

  it('should render error styling with left icon spacing', () => {
    render(<AuthTextInput aria-label="input-with-icon" hasError hasLeftIcon />);

    const input = screen.getByLabelText('input-with-icon');
    expect(input).toHaveClass('pl-10');
    expect(input).toHaveClass('border-red-400');
  });

  it('should expose readonly visual classes for readonly inputs', () => {
    render(<AuthTextInput aria-label="input-readonly" readOnly />);

    const input = screen.getByLabelText('input-readonly');
    expect(input).toHaveClass('read-only:bg-slate-100');
    expect(input).toHaveClass('read-only:text-slate-600');
  });
});
