import { IStackSettings, IStackProps, IStackRenderData } from './Stack.types';
import { parseGap, parsePadding } from './StackUtils';
import { augmentPlatformTheme } from '@uifabric/theming-react-native';
import { mergeSettings } from '@uifabric/theme-settings';

const nameMap: { [key: string]: string } = {
  start: 'flex-start',
  end: 'flex-end'
};

export function loadStackSettings(): void {
  const settings: IStackSettings = {
    root: {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        width: 'auto',
        overflow: 'visible',
        height: '100%'
      }
    },
    inner: {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        overflow: 'visible',
        boxSizing: 'border-box',
        maxWidth: '100vw'
      }
    }
  };
  augmentPlatformTheme({
    settings: {
      RNFStack: settings
    }
  });
}

export const keyProps: (keyof IStackProps)[] = [
  'verticalFill',
  'horizontal',
  'reversed',
  'gap',
  'grow',
  'wrap',
  'horizontalAlign',
  'verticalAlign',
  'disableShrink',
  'childrenGap',
  'maxHeight',
  'maxWidth',
  'padding'
];

export function processor(tokenProps: IStackProps, renderData: IStackRenderData): IStackSettings {
  const {
    verticalFill,
    horizontal,
    reversed,
    gap,
    grow,
    wrap,
    horizontalAlign,
    verticalAlign,
    disableShrink,
    maxHeight,
    maxWidth,
    padding
  } = tokenProps;
  let childrenGap = tokenProps.childrenGap || gap;
  const { rowGap, columnGap } = parseGap(childrenGap, renderData.theme);
  const horizontalMargin = `${-0.5 * columnGap.value}${columnGap.unit}`;
  const verticalMargin = `${-0.5 * rowGap.value}${rowGap.unit}`;
  const theme = renderData.theme;

  // styles to be applied to all direct children regardless of wrap or direction
  const childStyles = {
    textOverflow: 'ellipsis'
  };

  // selectors to be applied regardless of wrap or direction
  const commonSelectors = {
    // flexShrink styles are applied by the StackItem
    '> *:not(.ms-StackItem)': {
      flexShrink: disableShrink ? 0 : 1
    }
  };

  if (wrap) {
    const newSettings: IStackSettings = ({
      root: {
        style: [
          {
            maxWidth,
            maxHeight
          },
          horizontalAlign && {
            [horizontal ? 'justifyContent' : 'alignItems']: nameMap[horizontalAlign] || horizontalAlign
          },
          verticalAlign && {
            [horizontal ? 'alignItems' : 'justifyContent']: nameMap[verticalAlign] || verticalAlign
          },
          horizontal && {
            height: verticalFill ? '100%' : 'auto'
          }
        ]
      },
      inner: {
        style: [
          {
            marginLeft: horizontalMargin,
            marginRight: horizontalMargin,
            marginTop: verticalMargin,
            marginBottom: verticalMargin,
            padding: parsePadding(padding, theme),
            // avoid unnecessary calc() calls if horizontal gap is 0
            width: columnGap.value === 0 ? '100%' : `calc(100% + ${columnGap.value}${columnGap.unit})`,
            maxWidth: '100vw',

            selectors: {
              '> *': {
                margin: `${0.5 * rowGap.value}${rowGap.unit} ${0.5 * columnGap.value}${columnGap.unit}`,

                ...childStyles
              },
              ...commonSelectors
            }
          },
          horizontalAlign && {
            [horizontal ? 'justifyContent' : 'alignItems']: nameMap[horizontalAlign] || horizontalAlign
          },
          verticalAlign && {
            [horizontal ? 'alignItems' : 'justifyContent']: nameMap[verticalAlign] || verticalAlign
          },
          horizontal && {
            flexDirection: reversed ? 'row-reverse' : 'row',

            // avoid unnecessary calc() calls if vertical gap is 0
            height: rowGap.value === 0 ? '100%' : `calc(100% + ${rowGap.value}${rowGap.unit})`,

            selectors: {
              '> *': {
                maxWidth: columnGap.value === 0 ? '100%' : `calc(100% - ${columnGap.value}${columnGap.unit})`
              }
            }
          },
          !horizontal && {
            flexDirection: reversed ? 'column-reverse' : 'column',
            height: `calc(100% + ${rowGap.value}${rowGap.unit})`,

            selectors: {
              '> *': {
                maxHeight: rowGap.value === 0 ? '100%' : `calc(100% - ${rowGap.value}${rowGap.unit})`
              }
            }
          }
        ]
      }
    } as unknown) as IStackSettings;
    renderData.slotProps = mergeSettings(renderData.slotProps, newSettings);
  }

  return {
    root: {
      style: [
        {
          display: 'flex',
          flexDirection: horizontal ? (reversed ? 'row-reverse' : 'row') : reversed ? 'column-reverse' : 'column',
          flexWrap: 'nowrap',
          width: 'auto',
          height: verticalFill ? '100%' : 'auto',
          maxWidth,
          maxHeight,
          padding: parsePadding(padding, theme),
          boxSizing: 'border-box',

          selectors: {
            '> *': childStyles,

            // apply gap margin to every direct child except the first direct child if the direction is not reversed,
            // and the last direct one if it is
            [reversed ? '> *:not(:last-child)' : '> *:not(:first-child)']: [
              horizontal && {
                marginLeft: `${columnGap.value}${columnGap.unit}`
              },
              !horizontal && {
                marginTop: `${rowGap.value}${rowGap.unit}`
              }
            ],

            ...commonSelectors
          }
        },
        grow && {
          flexGrow: grow === true ? 1 : grow,
          overflow: 'hidden'
        },
        horizontalAlign && {
          [horizontal ? 'justifyContent' : 'alignItems']: nameMap[horizontalAlign] || horizontalAlign
        },
        verticalAlign && {
          [horizontal ? 'alignItems' : 'justifyContent']: nameMap[verticalAlign] || verticalAlign
        }
      ]
      // TODO: this cast may be hiding some potential issues with styling and name
      //        lookups and should be removed
    }
  } as IStackSettings;
}
