import { render } from '@testing-library/react';
import { AppIcon } from '@/components/atoms/app-icon';

describe('AppIcon', () => {
  it('should render app icon glyph through shared logo atom', () => {
    const { container } = render(<AppIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
