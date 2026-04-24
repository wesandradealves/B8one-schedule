'use client';

import { useEffect, useMemo } from 'react';
import type { Metadata } from 'next';
import { buildSeoMetadata, type SeoMetadataInput } from '@/utils/seo';

export const useSeoMetadata = (input: SeoMetadataInput): Metadata => {
  const { description, image, indexable, path, title } = input;

  const metadata = useMemo(() => {
    return buildSeoMetadata({ title, description, path, image, indexable });
  }, [description, image, indexable, path, title]);

  useEffect(() => {
    if (typeof metadata.title === 'string') {
      document.title = metadata.title;
    }

    if (typeof metadata.description !== 'string') {
      return;
    }

    let descriptionTag = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.setAttribute('name', 'description');
      document.head.appendChild(descriptionTag);
    }

    descriptionTag.setAttribute('content', metadata.description);
  }, [metadata.description, metadata.title]);

  return metadata;
};
