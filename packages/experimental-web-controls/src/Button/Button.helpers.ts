import { IButtonCustomizableProps, IButtonRenderData, IButtonSettings } from './Button.types';
import { renderSlot, IAsResolved } from '@uifabric/foundation-composable';
import { finalizeSettings } from '@uifabric/theming-react-native';
import {
  textTokenKeys,
  foregroundColorKeys,
  backgroundColorKeys,
  borderKeys,
  processBackgroundTokens,
  processForegroundTokens,
  processTextTokens,
  processBorderTokens
} from '../tokens/index';
import { mergeSettings } from '@uifabric/theme-settings';
import { useAsPressable } from '../Pressable/index';
import { IThemeQueryInputs } from '@uifabric/foundation-compose';

export function usePrepareState(data: IButtonRenderData): IButtonRenderData {
  // create the button state/info once, re-renders happen with pressable state changes so this is storage
  const { props, state } = useAsPressable(data.props);
  data.props = props;
  const newProps = data.props;
  data.state.info = {
    ...state,
    disabled: newProps.disabled,
    content: !!newProps.content,
    icon: !!newProps.icon
  };

  return data;
}

export function themeQueryInputs(name: string, renderData: IButtonRenderData): IThemeQueryInputs {
  return { name, overrides: renderData.state.info };
}

export const keyProps: (keyof IButtonCustomizableProps)[] = [
  'contentPadding',
  'contentPaddingFocused',
  'iconColor',
  'iconColorHovered',
  'iconColorPressed',
  'iconSize',
  'iconWeight'
].concat(textTokenKeys, foregroundColorKeys, backgroundColorKeys, borderKeys) as (keyof IButtonCustomizableProps)[];

export function processor(tokenProps: IButtonCustomizableProps, renderData: IButtonRenderData): IButtonSettings {
  const baseSettings = {
    root: {},
    stack: {},
    icon: {},
    content: {}
  };
  processBackgroundTokens(tokenProps, baseSettings.root);
  processForegroundTokens(tokenProps, baseSettings.icon, baseSettings.content);
  processTextTokens(tokenProps, baseSettings.content);
  processBorderTokens(tokenProps, baseSettings.root);

  return mergeSettings<IButtonSettings>(renderData.slotProps, baseSettings, {
    icon: {
      style: {
        overlayColor: tokenProps.iconColor
      }
    }
  });
}

export function finalizer(renderData: IButtonRenderData): IButtonRenderData {
  const { props, slotProps, theme } = renderData;
  const final: IButtonSettings = { root: props };

  if (props.content) {
    final.content = { children: props.content };
  }

  if (props.icon) {
    final.icon = { children: props.icon };
  }

  renderData.slotProps = finalizeSettings(theme, mergeSettings(slotProps, final));
  return renderData;
}

export function view(result: IAsResolved<IButtonRenderData>, ...children: React.ReactNode[]): JSX.Element | null {
  const slots = result.slots!;
  const info = result.state.info;
  const additionalChildren = children || [result.props.children];

  return renderSlot(slots.root, info.icon && renderSlot(slots.icon), info.content && renderSlot(slots.content), ...additionalChildren);
}
