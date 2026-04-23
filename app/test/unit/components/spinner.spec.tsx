import { render, screen } from '@testing-library/react';
import Spinner from '@/components/spinner/spinner';

const useLoaderMock = jest.fn();

jest.mock('@/hooks/useLoader', () => ({
  useLoader: () => useLoaderMock(),
}));

describe('Spinner', () => {
  it('should not render when loading is false', () => {
    useLoaderMock.mockReturnValue({ isLoading: false });
    const { container } = render(<Spinner />);
    expect(container.firstChild).toBeNull();
  });

  it('should render overlay when loading is true', () => {
    useLoaderMock.mockReturnValue({ isLoading: true });
    render(<Spinner />);
    expect(screen.getByRole('status', { name: 'Carregando' })).toBeInTheDocument();
  });
});
