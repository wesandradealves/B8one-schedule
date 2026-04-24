import styled from 'styled-components';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppCopyright } from '@/components/atoms/app-copyright';

const FooterRoot = styled.footer.attrs({
  className: 'flex items-center justify-between gap-3 border-t px-4 py-3 sm:px-6',
})`
  border-color: var(--color-border);
  background-color: var(--color-background);
`;

export function ProtectedFooter() {
  return (
    <FooterRoot>
      <AppIcon tone="primary" size="sm" />
      <AppCopyright />
    </FooterRoot>
  );
}
