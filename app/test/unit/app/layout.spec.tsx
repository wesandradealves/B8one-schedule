import type { ReactElement, ReactNode } from 'react';
import RootLayout, { metadata } from '@/app/layout';

jest.mock('@/app/providers', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('RootLayout', () => {
  interface HtmlProps {
    lang: string;
    children: ReactElement<BodyProps>;
  }

  interface BodyProps {
    children: ReactNode;
  }

  it('should expose base metadata contract', () => {
    expect(metadata.description).toBe('Portal de agendamento de exames');
    expect(metadata.title).toMatchObject({
      default: 'Agendamentos',
    });
  });

  it('should render children within html/body shell', () => {
    const tree = RootLayout({ children: 'layout-content' }) as ReactElement<HtmlProps>;
    expect(tree.type).toBe('html');
    expect(tree.props.lang).toBe('pt-BR');

    const body = tree.props.children;
    expect(body.type).toBe('body');
  });
});
