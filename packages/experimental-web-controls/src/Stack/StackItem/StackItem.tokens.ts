import { IStackItemProps } from './StackItem.types';
import { ITheme } from '@uifabric/theming';
import { styleFunction } from '@uifabric/foundation-tokens';

const alignMap: { [key: string]: string } = {
  start: 'flex-start',
  end: 'flex-end'
};

const _keyProps: (keyof IStackItemProps)[] = ['grow', 'shrink', 'disableShrink', 'align', 'verticalFill', 'margin'];

function _processor(tokenProps: IStackItemProps): IStackItemProps {
  const { grow, shrink, disableShrink, align, verticalFill, margin } = tokenProps;
  return {
    style: [
      {
        margin,
        height: verticalFill ? '100%' : 'auto',
        width: 'auto'
      },
      grow && { flexGrow: grow === true ? 1 : grow },
      (disableShrink || (!grow && !shrink)) && {
        flexShrink: 0
      },
      shrink &&
      !disableShrink && {
        flexShrink: 1
      },
      align && {
        alignSelf: alignMap[align] || align
      }
    ]
  };
}

export const stackItemTokenProcessor = styleFunction<IStackItemProps, ITheme>(_processor, _keyProps);
