import { IStackItemProps, IStackItemSettings } from './StackItem.types';
import { ITheme } from '@uifabric/theming';
import { setupTokenProcessor } from '@uifabric/foundation-tokens';

const alignMap: { [key: string]: string } = {
  start: 'flex-start',
  end: 'flex-end'
};

const _keyProps: (keyof IStackItemProps)[] = ['grow', 'shrink', 'disableShrink', 'align', 'verticalFill', 'margin'];

function _processor(tokenProps: IStackItemProps, _theme: ITheme): IStackItemSettings {
  const { grow, shrink, disableShrink, align, verticalFill, margin } = tokenProps;
  return {
    root: {
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
    }
  };
}

export const stackItemTokenProcessor = setupTokenProcessor<IStackItemProps, ITheme>(_processor, _keyProps);
