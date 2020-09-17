import { requireNativeComponent, Platform, View, ViewProps } from 'react-native';
import * as React from 'react';

const COMPONENT_NAME = 'MSFActivityIndicatorView';

/**
 * Native view wrapper
 */
const NativeActivityIndicator = Platform.OS === 'ios' ? requireNativeComponent(COMPONENT_NAME) : undefined;

export class ActivityIndicator extends React.PureComponent<ViewProps> {
  public render(): JSX.Element | null {
    if (NativeActivityIndicator === undefined) {
      return <View {...this.props} />;
    }

    return <NativeActivityIndicator {...this.props} />;
  }
}
