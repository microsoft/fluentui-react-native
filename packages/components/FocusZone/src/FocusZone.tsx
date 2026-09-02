/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { findNodeHandle } from 'react-native';

import { directComponent, mergeProps, phasedComponent } from '@fluentui-react-native/framework-base';
import { useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';

import type { FocusZoneProps } from './FocusZone.types';
import { focusZoneName } from './FocusZone.types';
import NativeFocusZone from './FocusZoneNativeComponent';

/**
 * Renders the native FocusZone without applying theme or appearance defaults.
 */
export const FocusZone = phasedComponent<FocusZoneProps>((props) => {
  const { componentRef, defaultTabbableElement } = props;
  const nativeRef = useViewCommandFocus(componentRef);
  const [nativeDefaultTabbableElement, setNativeDefaultTabbableElement] = React.useState<number | string>();

  React.useLayoutEffect(() => {
    if (typeof defaultTabbableElement === 'string') {
      setNativeDefaultTabbableElement(defaultTabbableElement);
    } else if (defaultTabbableElement?.current) {
      setNativeDefaultTabbableElement(findNodeHandle(defaultTabbableElement.current) ?? undefined);
    } else {
      setNativeDefaultTabbableElement(undefined);
    }
  }, [defaultTabbableElement]);

  return directComponent<FocusZoneProps>((renderProps) => {
    const {
      componentRef: _componentRef,
      defaultTabbableElement: _defaultTabbableElement,
      isCircularNavigation,
      navigateAtEnd = isCircularNavigation ? 'NavigateWrap' : 'NavigateStopAtEnds',
      ...nativeProps
    } = mergeProps(props, renderProps) as FocusZoneProps & { navigateAtEnd?: 'NavigateStopAtEnds' | 'NavigateWrap' | 'NavigateContinue' };

    return (
      <NativeFocusZone
        {...nativeProps}
        defaultTabbableElement={nativeDefaultTabbableElement}
        navigateAtEnd={navigateAtEnd}
        ref={nativeRef}
      />
    );
  });
});

FocusZone.displayName = focusZoneName;
