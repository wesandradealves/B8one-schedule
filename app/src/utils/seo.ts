import type { Metadata } from 'next';
import { env } from '@/utils/env';

export interface SeoMetadataInput {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  indexable?: boolean;
}

export const buildSeoMetadata = ({
  title,
  description,
  path,
  image,
  indexable = true,
}: SeoMetadataInput): Metadata => {
  const pageTitle = title ?? env.APP_NAME;
  const pageDescription = description ?? 'Portal de agendamento de exames';

  return {
    title,
    description: pageDescription,
    metadataBase: new URL(env.APP_BASE_URL),
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: 'website',
      url: path,
      images: image ? [{ url: image }] : undefined,
    },
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
};
