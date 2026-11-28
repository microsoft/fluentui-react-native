import type { FieldProps } from './field.types';
import { renderField_unstable } from './renderField';
import { useField_unstable } from './useField';
import { useFieldStyles_unstable } from './useFieldStyles';

export const Field = (props: FieldProps) => {
  const state = useField_unstable(props);
  useFieldStyles_unstable(state);
  return renderField_unstable(state);
};
Field.displayName = 'Field';
