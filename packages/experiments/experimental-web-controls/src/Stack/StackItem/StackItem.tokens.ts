import { IStackItemProps, IStackItemTokens } from './StackItem.types';
import { ITheme } from '@uifabricshared/theming-ramp';
import { styleFunction } from '@uifabricshared/foundation-tokens';

const alignMap: { [key: string]: string } = {
  start: 'flex-start',
  end: 'flex-end'
};

const _keyProps: (keyof IStackItemTokens)[] = ['grow', 'shrink', 'disableShrink', 'align', 'verticalFill', 'margin'];

function _processor(tokenProps: IStackItemTokens): IStackItemProps {
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

export const stackItemTokenProcessor = styleFunction<IStackItemProps, IStackItemTokens, ITheme>(_processor, _keyProps);
