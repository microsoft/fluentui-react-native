/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { View, Platform, Text } from 'react-native';
import { PresenceBadge } from '@fluentui-react-native/badge';

export const PresenceBadgeTest: React.FunctionComponent = () => {
  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);

  return (
    <View>
      {svgIconsEnabled && (
        <>
          <Text>Presence Badge</Text>
          <PresenceBadge status="available" size="extraLarge" />
          <PresenceBadge status="available" outOfOffice={true} size="large" />
          <PresenceBadge status="doNotDisturb" outOfOffice={true} />
          <PresenceBadge status="away" size="small" />
          <PresenceBadge status="busy" size="tiny" />
          <PresenceBadge status="offline" />
          <PresenceBadge status="outOfOffice" />
          <PresenceBadge status="away" />
        </>
      )}
    </View>
  );
};
