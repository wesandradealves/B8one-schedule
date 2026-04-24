import { fireEvent, render, screen } from '@testing-library/react';
import { ListPagination } from '@/components/molecules/list-pagination';

describe('ListPagination', () => {
  it('should not render when totalPages is lower than 2', () => {
    const { container } = render(
      <ListPagination page={1} totalPages={1} onPageChange={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render pages and trigger page change', () => {
    const onPageChange = jest.fn();

    render(<ListPagination page={2} totalPages={4} onPageChange={onPageChange} />);

    expect(screen.getByRole('button', { name: 'Ir para página 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ir para página 2' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Ir para página 3' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ir para página 3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
