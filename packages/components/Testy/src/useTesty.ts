import { TestyProps } from './Testy.types';

export const useTesty = (props: TestyProps): TestyProps => {
  const { text = 'Default text', ...rest } = props;
  // write your code here

  return {
    text,
    ...rest,
  };
};
