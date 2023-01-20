import { DividerProps } from './Divider.types';

export const useDivider = (props: DividerProps): DividerProps => {
  const defaultProps: DividerProps = {
    alignContent: 'center',
    appearance: 'default',
    vertical: false,
  };
  return { ...defaultProps, ...props };
};
