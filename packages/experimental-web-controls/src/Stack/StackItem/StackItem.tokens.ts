import { IStackItemProps, IStackItemRenderData, IStackItemSettings } from './StackItem.types';
import { mergeSettings } from '@uifabric/theme-settings';

const alignMap: { [key: string]: string } = {
  start: 'flex-start',
  end: 'flex-end'
};

export const keyProps: (keyof IStackItemProps)[] = ['grow', 'shrink', 'disableShrink', 'align', 'verticalFill', 'margin'];

export function processor(tokenProps: IStackItemProps, renderData: IStackItemRenderData): IStackItemSettings {
  const { grow, shrink, disableShrink, align, verticalFill, margin } = tokenProps;
  const newSettings: IStackItemSettings = {
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
  return mergeSettings(renderData.slotProps, newSettings);
}
