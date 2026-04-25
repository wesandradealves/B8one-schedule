import { render, screen } from '@testing-library/react';
import { ExamAvailableCard } from '@/components/molecules/exam-available-card';

describe('ExamAvailableCard', () => {
  it('renders exam details with scheduling actions', () => {
    render(
      <ExamAvailableCard
        exam={{
          id: 'exam-1',
          name: 'Hemograma',
          description: 'Exame laboratorial',
          durationMinutes: 30,
          priceCents: 10000,
        }}
      />,
    );

    expect(screen.getByText('Hemograma')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver datas disponíveis' })).toHaveAttribute(
      'href',
      '/app/exams/exam-1',
    );
    expect(screen.getByRole('link', { name: 'Agendar' })).toHaveAttribute(
      'href',
      '/app/exams/exam-1',
    );
  });
});
