import { fireEvent, render, screen } from '@testing-library/react';
import {
  ListFormInput,
  ListFormSelect,
  ListFormTextarea,
} from '@/components/atoms/list-form-controls';

describe('list form controls', () => {
  it('should render input, select and textarea controls', () => {
    const onInputChange = jest.fn();
    const onSelectChange = jest.fn();
    const onTextareaChange = jest.fn();

    render(
      <>
        <ListFormInput
          aria-label="campo input"
          value="valor"
          onChange={onInputChange}
        />
        <ListFormSelect aria-label="campo select" value="a" onChange={onSelectChange}>
          <option value="a">A</option>
          <option value="b">B</option>
        </ListFormSelect>
        <ListFormTextarea
          aria-label="campo textarea"
          value="texto"
          onChange={onTextareaChange}
        />
      </>,
    );

    fireEvent.change(screen.getByLabelText('campo input'), {
      target: { value: 'novo' },
    });
    fireEvent.change(screen.getByLabelText('campo select'), {
      target: { value: 'b' },
    });
    fireEvent.change(screen.getByLabelText('campo textarea'), {
      target: { value: 'novo texto' },
    });

    expect(onInputChange).toHaveBeenCalled();
    expect(onSelectChange).toHaveBeenCalled();
    expect(onTextareaChange).toHaveBeenCalled();
  });

  it('should support number and date input types', () => {
    render(
      <>
        <ListFormInput aria-label="numero" type="number" value="10" readOnly />
        <ListFormInput aria-label="data" type="date" value="2026-05-01" readOnly />
      </>,
    );

    expect(screen.getByLabelText('numero')).toHaveAttribute('type', 'number');
    expect(screen.getByLabelText('data')).toHaveAttribute('type', 'date');
  });
});
