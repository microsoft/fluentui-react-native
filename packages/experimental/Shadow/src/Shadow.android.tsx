import * as React from 'react';
import { View } from 'react-native';
import { ShadowProps, shadowName } from './Shadow.types';
import { stagedComponent } from '@fluentui-react-native/framework';

export const Shadow = stagedComponent((props: ShadowProps) => {
  // Android doesn't support customizing Shadow color/blur/offset, everything is handled by the native `elevation` prop
  // Fluent shadow tokens don't reflect this, so let's just map the blur radius to elevation to approximate the correct shadow.
  const shadowToken = props.shadowToken;
  const elevationStyle = { elevation: shadowToken.key.blur };
  return (_final: ShadowProps, children: React.ReactNode) => {
    return <View style={elevationStyle}>{children}</View>;
  };
}, true);

Shadow.displayName = shadowName;

export default Shadow;
