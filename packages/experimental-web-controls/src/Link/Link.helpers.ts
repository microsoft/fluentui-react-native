'use strict';
import * as React from 'react';
import { ILinkRenderData, ILinkState, ILinkCustomizableProps, ILinkSlotProps, ILinkType } from './Link.types';
import { IDivProps } from '../htmlTypes';
import { useAsPressable, IWithOnStateChange, usePressableStateChange } from '../Pressable';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { IUseComposeStyling } from '@uifabricshared/foundation-compose';

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

export function useLinkPrepareProps(userProps: ILinkCustomizableProps, useStyling: IUseComposeStyling<ILinkType>): ILinkRenderData {
  // create the Link state/info once, re-renders happen with pressable state changes so this is storage
  const { props, state } = useAsPressable(userProps);
  const { linkProps, linkState } = useAsLink(props);
  linkProps.onClick = linkProps['internalOnClick'];

  const URL = userProps.URL;
  const resultState = { ...state, ...linkState, URL: !!URL };

  // get the style slot props, using the state to resolve overrides
  const styleSlotProps = useStyling(linkProps, resultState);

  // setup the other props to get merged in
  const transferProps = URL ? { root: linkProps } : { buttonAsRoot: linkProps };
  const finalProps = {
    root: { href: URL, URL: undefined, content: undefined },
    content: { children: userProps.content }
  };

  // merge everything together
  const slotProps = mergeSettings<ILinkSlotProps>(styleSlotProps, transferProps, finalProps);

  return { slotProps, state: resultState };
}
