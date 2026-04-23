import type { Metadata } from 'next';
import '@/assets/scss/globals.scss';
import Providers from '@/app/providers';
import { AppShell } from '@/app/style';
import { env } from '@/utils/env';

export const metadata: Metadata = {
  title: {
    default: env.APP_NAME,
    template: `%s | ${env.APP_NAME}`,
  },
  description: 'Portal de agendamento de exames',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
