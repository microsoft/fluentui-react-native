import { RadioGroupExperimentalProps } from './RadioGroup.types';

export const useRadioGroupExperimental = (props: RadioGroupExperimentalProps): RadioGroupExperimentalProps => {
  const { text = 'Default text', ...rest } = props;
  // write your code here

  return {
    text,
    ...rest,
  };
};
