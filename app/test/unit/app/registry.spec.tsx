import { render, screen } from '@testing-library/react';
import StyledComponentsRegistry from '@/app/registry';

const useServerInsertedHTMLMock = jest.fn((callback: () => React.ReactNode) => callback());

jest.mock('next/navigation', () => ({
  useServerInsertedHTML: (callback: () => React.ReactNode) => {
    useServerInsertedHTMLMock(callback);
  },
}));

describe('StyledComponentsRegistry', () => {
  it('should render children and register style insertion callback', () => {
    render(
      <StyledComponentsRegistry>
        <div>registry-content</div>
      </StyledComponentsRegistry>,
    );

    expect(screen.getByText('registry-content')).toBeInTheDocument();
    expect(useServerInsertedHTMLMock).toHaveBeenCalledTimes(1);
    expect(useServerInsertedHTMLMock.mock.results[0].value).toBeDefined();
  });
});
