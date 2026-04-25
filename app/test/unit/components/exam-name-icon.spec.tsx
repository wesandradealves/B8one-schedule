import { render, screen } from '@testing-library/react';
import {
  ExamNameIcon,
  resolveExamIconName,
} from '@/components/atoms/exam-name-icon';

describe('ExamNameIcon', () => {
  it('resolves icon names based on exam keywords', () => {
    expect(resolveExamIconName('Hemograma completo')).toBe('blood');
    expect(resolveExamIconName('Ressonância magnética')).toBe('imaging');
    expect(resolveExamIconName('Eletrocardiograma')).toBe('heart');
    expect(resolveExamIconName('Urina tipo I')).toBe('urine');
    expect(resolveExamIconName('Eletroencefalograma')).toBe('neuro');
    expect(resolveExamIconName('Perfil hormonal feminino')).toBe('women');
    expect(resolveExamIconName('Exame sem categoria')).toBe('general');
  });

  it('renders the resolved icon', () => {
    render(<ExamNameIcon examName="Hemograma completo" />);
    expect(screen.getByTestId('exam-name-icon-blood')).toBeInTheDocument();
  });
});
