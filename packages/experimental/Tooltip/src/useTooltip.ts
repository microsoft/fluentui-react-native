import { TooltipProps } from './Tooltip.types';

export const useTooltip = (props: TooltipProps): TooltipProps => {
  const { text = 'Default text', ...rest } = props;
  // write your code here

  return {
    text,
    ...rest,
  };
};
