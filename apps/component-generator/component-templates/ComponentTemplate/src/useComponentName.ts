import { ComponentNameProps } from './ComponentName.types';

export const useComponentName = (props: ComponentNameProps): ComponentNameProps => {
  const { text = 'Default text', ...rest } = props;
  // write your code here

  return {
    text,
    ...rest,
  };
};
