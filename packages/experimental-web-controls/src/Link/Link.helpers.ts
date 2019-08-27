'use strict';

import { ILinkRenderData, ILinkCustomizableProps, ILinkSettings, ILinkTokens } from './Link.types';
import { useAsPressable } from '../Pressable';
import { foregroundColorKeys, processForegroundTokens, processTextTokens, processTokens, textTokenKeys } from '../tokens';
import { mergeSettings } from '@uifabric/theme-settings';
import { finalizeSettings } from '@uifabric/theming-react-native';
import {
  IAsResolved,
  IWithComposable,
  IGenericProps,
  IProcessResult,
  renderSlot,
  wrapStockComponent,
  INativeSlotType
} from '@uifabric/foundation-composable';
import { IThemeQueryInputs } from '@uifabric/foundation-compose';

export function usePrepareState(data: ILinkRenderData): ILinkRenderData {
  // create the Link state/info once, re-renders happen with pressable state changes so this is storage
  const { props, state } = useAsPressable(data.props);
  data.props = props;
  data.state = {
    ...state,
    disabled: data.props.disabled
  };

  return data;
}

export function themeQueryInputs(name: string, renderData: ILinkRenderData): IThemeQueryInputs {
  return { name, overrides: renderData.state };
}

export const keyProps: (keyof ILinkCustomizableProps)[] = ['content', 'disabled', 'URL'].concat(
  textTokenKeys,
  foregroundColorKeys
) as (keyof ILinkCustomizableProps)[];
export const tokenKeys: (keyof ILinkTokens)[] = ['visitedLinkColor'];

function processLinkTokens(tokens: ILinkTokens, ...targetProps: object[]): void {
  processTokens(tokens, tokenKeys, ...targetProps);
}

export function processor(tokenProps: ILinkCustomizableProps, renderData: ILinkRenderData): ILinkSettings {
  const baseSettings = {
    root: {},
    content: {}
  };
  processForegroundTokens(tokenProps, baseSettings.content);
  processTextTokens(tokenProps, baseSettings.content);
  processLinkTokens(tokenProps, baseSettings.root);

  return mergeSettings<ILinkSettings>(renderData.slotProps, baseSettings, {
    root: { href: tokenProps.URL }
  });
}

export function finalizer(renderData: ILinkRenderData): ILinkRenderData {
  const { props, slotProps, theme } = renderData;
  const final: ILinkSettings = { root: props };

  if (props.content) {
    final.content = { children: props.content };
  }

  delete renderData.props.URL;

  renderData.slotProps = finalizeSettings(theme, mergeSettings(slotProps, final));
  return renderData;
}

export function view(result: IAsResolved<ILinkRenderData>, ...children: React.ReactNode[]): JSX.Element | null {
  const slots = result.slots!;
  const additionalChildren = children || [result.props.children];

  return renderSlot(slots.root, renderSlot(slots.content), ...additionalChildren);
}

export const LinkRoot: IWithComposable = {
  __composable: {
    useProcessProps(props: IGenericProps): IProcessResult {
      return { props: props };
    },

    render: (propInfo: IProcessResult, ...children): JSX.Element | null => {
      if (propInfo.props['href']) {
        // To disable a web anchor, we must remove the href property from the props list
        if (propInfo.props['disabled']) {
          delete propInfo.props['href'];
        }
        return wrapStockComponent('a' as INativeSlotType).render(propInfo, ...children);
      }
      return wrapStockComponent('button' as INativeSlotType).render(propInfo, ...children);
    }
  }
};
