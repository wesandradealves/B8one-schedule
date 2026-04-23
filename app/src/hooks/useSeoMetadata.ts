'use client';

import { useMemo } from 'react';
import type { Metadata } from 'next';
import { buildSeoMetadata, type SeoMetadataInput } from '@/utils/seo';

export const useSeoMetadata = (input: SeoMetadataInput): Metadata => {
  const { description, image, indexable, path, title } = input;

  return useMemo(() => {
    return buildSeoMetadata({ title, description, path, image, indexable });
  }, [description, image, indexable, path, title]);
};
