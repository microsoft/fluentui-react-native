import { TooltipProps } from './Tooltip.types';

export const useTooltip = (props: TooltipProps): TooltipProps => {
  const { ...rest } = props;
  // write your code here

  return {
    ...rest,
  };
};
