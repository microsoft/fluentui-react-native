import { DividerInfo, DividerProps, DividerState } from './Divider.types';

export const useDivider = (props: DividerProps): DividerInfo => {
  const { alignContent = 'center', icon, inset, text, vertical } = props;
  const state: DividerState = {
    alignStart: alignContent === 'start',
    alignEnd: alignContent === 'end',
    hasChildren: icon !== undefined || text !== undefined,
    hasInset: inset,
    vertical: vertical,
  };
  return { props, state };
};
