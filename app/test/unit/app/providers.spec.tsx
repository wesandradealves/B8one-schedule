import { render, screen, waitFor } from '@testing-library/react';
import Providers from '@/app/providers';

const teardownMock = jest.fn();
const setupApiInterceptorsMock = jest.fn((_: unknown) => teardownMock);

jest.mock('@/services/api', () => ({
  setupApiInterceptors: (bindings: unknown) => setupApiInterceptorsMock(bindings),
}));

jest.mock('@/app/registry', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/spinner/spinner', () => ({
  __esModule: true,
  default: () => <div data-testid="global-spinner" />,
}));

describe('Providers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children and configure api interceptors', async () => {
    const { unmount } = render(
      <Providers>
        <div>providers-content</div>
      </Providers>,
    );

    expect(screen.getByText('providers-content')).toBeInTheDocument();
    expect(screen.getByTestId('global-spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(setupApiInterceptorsMock).toHaveBeenCalledTimes(1);
    });

    unmount();
    expect(teardownMock).toHaveBeenCalledTimes(1);
  });
});
