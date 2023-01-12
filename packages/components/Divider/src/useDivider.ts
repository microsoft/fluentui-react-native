import { DividerProps } from './Divider.types';

export const useDivider = (props: DividerProps): DividerProps => {
  const { text = 'Default text', ...rest } = props;
  // write your code here

  return {
    text,
    ...rest,
  };
};
