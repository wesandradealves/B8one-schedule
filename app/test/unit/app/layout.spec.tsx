import type { ReactElement } from 'react';
import RootLayout, { metadata } from '@/app/layout';

jest.mock('@/app/providers', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('RootLayout', () => {
  it('should expose base metadata contract', () => {
    expect(metadata.description).toBe('Portal de agendamento de exames');
    expect(metadata.title).toMatchObject({
      default: 'B8one Agendamentos',
    });
  });

  it('should render children within html/body shell', () => {
    const tree = RootLayout({ children: 'layout-content' }) as ReactElement;
    expect(tree.type).toBe('html');
    expect((tree.props as any).lang).toBe('pt-BR');

    const body = (tree.props as any).children as ReactElement;
    expect(body.type).toBe('body');
  });
});
