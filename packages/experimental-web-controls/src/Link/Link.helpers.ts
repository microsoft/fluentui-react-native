'use strict';
import * as React from 'react';
import { ILinkRenderData, ILinkSettings, ILinkState } from './Link.types';
import { IDivProps } from '../htmlTypes';
import { useAsPressable, IWithOnStateChange, usePressableStateChange } from '../Pressable';
import { mergeSettings } from '@uifabric/foundation-settings';
import { IAsResolved, renderSlot } from '@uifabric/foundation-composable';
import { IThemeQueryInputs } from '@uifabric/foundation-compose';

export type retProp = { linkProps: IWithOnStateChange<IDivProps>; linkState: ILinkState; setState: (partial: ILinkState) => void };

export function useAsLink(props: IWithOnStateChange<IDivProps>): retProp {
  const initialState = { visited: false };
  const [state, onSetState] = usePressableStateChange<ILinkState, IWithOnStateChange<IDivProps>>(initialState, props);
  const internalOnClick = React.useCallback(
    _e => {
      onSetState({ visited: true });
      if (props.onClick) {
        props.onClick(_e);
      }
    },
    [onSetState]
  );
  const newProps = {
    ...props,
    internalOnClick
  };

  return { linkProps: newProps, linkState: state, setState: onSetState };
}

export function usePrepareState(data: ILinkRenderData): ILinkRenderData {
  // create the Link state/info once, re-renders happen with pressable state changes so this is storage
  const { props, state } = useAsPressable(data.props);
  const { linkProps, linkState } = useAsLink(data.props);
  data.props = { ...props, ...linkProps };
  data.state = {
    ...state,
    ...linkState,
    URL: !!data.props.URL
  };

  return data;
}

export function themeQueryInputs(name: string, renderData: ILinkRenderData): IThemeQueryInputs {
  return { name, overrides: renderData.state };
}

export function finalizer(renderData: ILinkRenderData): ILinkRenderData {
  const { props, slotProps } = renderData;
  const final: ILinkSettings = { root: props };

  if (props.content) {
    final.content = { children: props.content };
  }

  // If we have a URL,
  if (props['URL']) {
    // Only pass the URL prop to the href attribute if the Link is enabled
    if (!props['disabled']) {
      final.root['href'] = props['URL'];
    }
    delete final.buttonAsRoot;
  } else {
    final.buttonAsRoot = final.root;
    delete final.root;
  }

  // Map internalOnClick over the original onClick; internalOnClick sets visited=true and calls the original onClick, if it exists
  props['onClick'] = props['internalOnClick'];

  renderData.slotProps = mergeSettings(slotProps, final);
  return renderData;
}

export function view(result: IAsResolved<ILinkRenderData>, ...children: React.ReactNode[]): JSX.Element | null {
  const slots = result.slots!;
  const additionalChildren = children || [result.props.children];

  return renderSlot(result.state.URL ? slots.root : slots.buttonAsRoot, renderSlot(slots.content), ...additionalChildren);
}
