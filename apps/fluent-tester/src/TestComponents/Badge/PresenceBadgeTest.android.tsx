/* eslint-disable @typescript-eslint/no-var-requires */
import React, { useState } from 'react';
import { View, Text } from 'react-native';

import { ToggleButton } from '@fluentui/react-native';
import { PresenceBadge } from '@fluentui-react-native/badge';

export const PresenceBadgeTest: React.FunctionComponent = () => {
  const [outOfOffice, setOutOfOffice] = useState(false);
  return (
    <View>
      <ToggleButton onClick={() => setOutOfOffice(!outOfOffice)} checked={outOfOffice}>
        Set {outOfOffice ? ' In office' : ' Out of office'}
      </ToggleButton>
      <Text>Small</Text>
      <View style={{ flexDirection: 'row' }}>
        <PresenceBadge status="available" size="small" outOfOffice={outOfOffice} />
        <PresenceBadge status="blocked" size="small" outOfOffice={outOfOffice} />
        <PresenceBadge status="doNotDisturb" size="small" outOfOffice={outOfOffice} />
        <PresenceBadge status="away" size="small" outOfOffice={outOfOffice} />
        <PresenceBadge status="busy" size="small" outOfOffice={outOfOffice} />
        <PresenceBadge status="offline" size="small" outOfOffice={outOfOffice} />
        <PresenceBadge status="outOfOffice" size="small" outOfOffice={outOfOffice} />
        <PresenceBadge status="unknown" size="small" outOfOffice={outOfOffice} />
      </View>
      <Text>Medium</Text>
      <View style={{ flexDirection: 'row' }}>
        <PresenceBadge status="available" size="medium" outOfOffice={outOfOffice} />
        <PresenceBadge status="blocked" size="medium" outOfOffice={outOfOffice} />
        <PresenceBadge status="doNotDisturb" size="medium" outOfOffice={outOfOffice} />
        <PresenceBadge status="away" size="medium" outOfOffice={outOfOffice} />
        <PresenceBadge status="busy" size="medium" outOfOffice={outOfOffice} />
        <PresenceBadge status="offline" size="medium" outOfOffice={outOfOffice} />
        <PresenceBadge status="outOfOffice" size="medium" outOfOffice={outOfOffice} />
        <PresenceBadge status="unknown" size="medium" outOfOffice={outOfOffice} />
      </View>
      <Text>Large</Text>
      <View style={{ flexDirection: 'row' }}>
        <PresenceBadge status="available" size="large" outOfOffice={outOfOffice} />
        <PresenceBadge status="blocked" size="large" outOfOffice={outOfOffice} />
        <PresenceBadge status="doNotDisturb" size="large" outOfOffice={outOfOffice} />
        <PresenceBadge status="away" size="large" outOfOffice={outOfOffice} />
        <PresenceBadge status="busy" size="large" outOfOffice={outOfOffice} />
        <PresenceBadge status="offline" size="large" outOfOffice={outOfOffice} />
        <PresenceBadge status="outOfOffice" size="large" outOfOffice={outOfOffice} />
        <PresenceBadge status="unknown" size="large" outOfOffice={outOfOffice} />
      </View>
    </View>
  );
};
