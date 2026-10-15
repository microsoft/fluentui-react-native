/** @jsxImportSource @fluentui-react-native/framework-base */
import type * as React from 'react';
import { StyleSheet } from 'react-native';

import { directComponent } from '@fluentui-react-native/framework-base';

import type { CalloutTokens } from '../legacy/callout/Callout.types';
import NativeCalloutView from '../specs/components/CalloutNativeComponent';
import type { NativeProps } from '../specs/components/CalloutNativeComponent';

export type CalloutHostProps = Omit<NativeProps, keyof CalloutTokens | 'target'> &
  CalloutTokens & {
    ref?: React.Ref<React.ComponentRef<typeof NativeCalloutView>>;
    /** Resolved native anchor tag or registered anchor identifier. */
    target?: number | string;
  };

const colorTransparent = '#00000000';

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
  },
});

/**
 * Hook-free native Callout binding shared by the legacy and modern facades. It applies only the positioning and
 * native-safe appearance values the native views require and does not resolve theme defaults.
 */
export const CalloutHost = directComponent<CalloutHostProps>(
  ({ backgroundColor, borderColor, borderRadius, borderWidth, maxHeight, maxWidth, minWidth, style, ...nativeProps }) => {
    // The native views require concrete border and background values when drawing the popup layer.
    const calloutStyle = {
      backgroundColor: backgroundColor ?? colorTransparent,
      borderColor: borderColor ?? colorTransparent,
      borderWidth: borderWidth ?? 0,
      borderRadius: borderRadius ?? 0,
      ...(maxHeight != null && { maxHeight }),
      ...(maxWidth != null && { maxWidth }),
      ...(minWidth != null && { minWidth }),
    };

    return (
      <NativeCalloutView
        {...nativeProps}
        maxHeight={typeof maxHeight === 'number' ? maxHeight : undefined}
        maxWidth={typeof maxWidth === 'number' ? maxWidth : undefined}
        minWidth={typeof minWidth === 'number' ? minWidth : undefined}
        style={[styles.root, calloutStyle, style]}
      />
    );
  },
);
