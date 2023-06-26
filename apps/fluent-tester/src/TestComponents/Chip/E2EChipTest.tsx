import * as React from 'react';
import { View } from 'react-native';

import { Chip } from '@fluentui-react-native/chip';
import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { Text } from '@fluentui-react-native/text';

import { CHIP_TEST_COMPONENT, CHIP_END_TEXT, CHIP_START_TEXT, CHIP_TEXT } from '../../../../E2E/src/Chip/consts';
import { testProps } from '../Common/TestProps';

export const E2EChipTest: React.FunctionComponent = () => {
  const [text, setText] = React.useState<string>(CHIP_START_TEXT);
  const showTextOnSelection = React.useCallback(
    (_e: InteractionEvent, isSelected: boolean) => setText(isSelected ? CHIP_END_TEXT : CHIP_START_TEXT),
    [],
  );
  return (
    <View>
      <Text {...testProps(CHIP_TEXT)}>{text}</Text>
      <Chip
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(CHIP_TEST_COMPONENT)}
        chipColor="success"
        showCloseIcon
        onSelectionChange={showTextOnSelection}
      >
        Basic Chip
      </Chip>
    </View>
  );
};
