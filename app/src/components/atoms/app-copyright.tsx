import styled from 'styled-components';
import { PixelHeart } from '@/components/atoms/pixel-heart';

const CopyrightRoot = styled.p.attrs({
  className: 'inline-flex items-center gap-1 text-xs',
})`
  color: var(--color-text-secondary);
`;

const AuthorLink = styled.a.attrs({
  className: 'font-medium text-brand underline-offset-2 hover:underline',
  href: 'https://github.com/wesandradealves',
  target: '_blank',
  rel: 'noopener noreferrer',
})``;

interface AppCopyrightProps {
  className?: string;
}

export function AppCopyright({ className }: AppCopyrightProps) {
  return (
    <CopyrightRoot className={className}>
      <span>Feito com</span>
      <PixelHeart />
      <span>por</span>
      <AuthorLink>Wesley Alves</AuthorLink>
    </CopyrightRoot>
  );
}
