import { buildSeoMetadata } from '@/utils/seo';

describe('seo utils', () => {
  it('should build metadata with explicit values', () => {
    const metadata = buildSeoMetadata({
      title: 'Exames',
      description: 'Lista de exames',
      path: '/app/exams',
      indexable: false,
    });

    expect(metadata.title).toBe('Exames');
    expect(metadata.description).toBe('Lista de exames');
    expect(metadata.alternates?.canonical).toBe('/app/exams');
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.openGraph?.title).toBe('Exames');
  });

  it('should fallback to default description and keep indexable by default', () => {
    const metadata = buildSeoMetadata({});
    expect(metadata.description).toBe('Portal de agendamento de exames');
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it('should include open graph image when image is provided', () => {
    const metadata = buildSeoMetadata({
      title: 'Detalhes do exame',
      path: '/app/exams/123',
      image: 'https://example.com/exam.png',
    });

    expect(metadata.openGraph?.images).toEqual([{ url: 'https://example.com/exam.png' }]);
  });
});
