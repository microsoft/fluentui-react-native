import { IButtonRenderData, IButtonSettings } from './Button.types';
import { renderSlot, IAsResolved } from '@uifabricshared/foundation-composable';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { useAsPressable } from '../Pressable/index';
import { IThemeQueryInputs } from '@uifabricshared/foundation-compose';

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

export function finalizer(renderData: IButtonRenderData): IButtonRenderData {
  const { props, slotProps } = renderData;
  const final: IButtonSettings = { root: props };

  if (props.content) {
    final.content = { children: props.content };
  }

  if (props.icon) {
    final.icon = { children: props.icon };
  }

  renderData.slotProps = mergeSettings(slotProps, final);
  return renderData;
}

export function view(result: IAsResolved<IButtonRenderData>, ...children: React.ReactNode[]): JSX.Element | null {
  const slots = result.slots!;
  const info = result.state.info;
  const additionalChildren = children || [result.props.children];

  return renderSlot(slots.root, info.icon && renderSlot(slots.icon), info.content && renderSlot(slots.content), ...additionalChildren);
}
