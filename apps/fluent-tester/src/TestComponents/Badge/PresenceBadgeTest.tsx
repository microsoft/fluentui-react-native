import React, { useState, useCallback } from 'react';
import { View, Platform, Text } from 'react-native';

import { ToggleButton } from '@fluentui/react-native';
import type { BadgeSize } from '@fluentui-react-native/badge';
import { PresenceBadge, BadgeSizes } from '@fluentui-react-native/badge';

import { StyledPicker } from '../Common/StyledPicker';

const badgeSizes: BadgeSize[] = [...BadgeSizes];
export const PresenceBadgeTest: React.FunctionComponent = () => {
  const [size, setSize] = useState<BadgeSize>('medium');
  const [outOfOffice, setOutOfOffice] = useState(false);
  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);

  const onSizeChange = useCallback((value) => setSize(value), []);
  return (
    <View>
      <StyledPicker prompt="Size" selected={size} onChange={onSizeChange} collection={badgeSizes} />
      <ToggleButton onClick={() => setOutOfOffice(!outOfOffice)} checked={outOfOffice}>
        Set {outOfOffice ? ' In office' : ' Out of office'}
      </ToggleButton>
      {svgIconsEnabled && (
        <>
          <Text>Presence Badge</Text>
          <View style={{ flexDirection: 'row', marginEnd: 8 }}>
            <PresenceBadge status="available" size={size} outOfOffice={outOfOffice} />
            <PresenceBadge status="blocked" size={size} outOfOffice={outOfOffice} />
            <PresenceBadge status="doNotDisturb" size={size} outOfOffice={outOfOffice} />
            <PresenceBadge status="away" size={size} outOfOffice={outOfOffice} />
            <PresenceBadge status="busy" size={size} outOfOffice={outOfOffice} />
            <PresenceBadge status="offline" size={size} outOfOffice={outOfOffice} />
            <PresenceBadge status="outOfOffice" size={size} outOfOffice={outOfOffice} />
            <PresenceBadge status="unknown" size={size} outOfOffice={outOfOffice} />
          </View>
        </>
      )}
    </View>
  );
};
