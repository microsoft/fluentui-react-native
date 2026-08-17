/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { findNodeHandle } from 'react-native';

import { directComponent, mergeProps, phasedComponent } from '@fluentui-react-native/framework-base';

import type { FocusZoneProps } from './FocusZone.types';
import { focusZoneName } from './FocusZone.types';
import NativeFocusZone from './FocusZoneNativeComponent';

/**
 * Renders the native FocusZone without applying theme or appearance defaults.
 */
export const FocusZone = phasedComponent<FocusZoneProps>((props) => {
  const { defaultTabbableElement } = props;
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
      componentRef,
      defaultTabbableElement: _defaultTabbableElement,
      isCircularNavigation,
      ...nativeProps
    } = mergeProps(props, renderProps);

    return (
      <NativeFocusZone
        {...nativeProps}
        defaultTabbableElement={nativeDefaultTabbableElement}
        navigateAtEnd={isCircularNavigation ? 'NavigateWrap' : 'NavigateStopAtEnds'}
        ref={componentRef}
      />
    );
  });
});

FocusZone.displayName = focusZoneName;
