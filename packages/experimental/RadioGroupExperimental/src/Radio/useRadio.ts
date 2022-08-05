import { RadioProps } from './Radio.types';

export const useRadioGroup = (props: RadioProps): RadioProps => {
  const { text = 'Default text', ...rest } = props;
  // write your code here

  return {
    text,
    ...rest,
  };
};
