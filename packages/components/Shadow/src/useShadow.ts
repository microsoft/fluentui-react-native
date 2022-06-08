import { ShadowProps } from './Shadow.types';

export const useShadow = (props: ShadowProps): ShadowProps => {
  const { text = 'Default text', ...rest } = props;
  // write your code here

  return {
    text,
    ...rest,
  };
};
