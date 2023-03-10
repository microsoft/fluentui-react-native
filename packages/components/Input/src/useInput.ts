import type { InputProps } from './Input.types';

export const useInput = (props: InputProps): InputProps => {
  const { label: text = 'Default text', ...rest } = props;
  // write your code here

  return {
    label: text,
    ...rest,
  };
};
