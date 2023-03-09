import type { InputProps } from './Input.types';

export const useInput = (props: InputProps): InputProps => {
  const { text = 'Default text', ...rest } = props;
  // write your code here

  return {
    text,
    ...rest,
  };
};
