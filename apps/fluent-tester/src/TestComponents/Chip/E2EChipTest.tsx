import * as React from 'react';
import { View } from 'react-native';

import { Chip } from '@fluentui-react-native/chip';
import {
  CHIP_CALLBACK_TEXT_END_STATE,
  CHIP_CALLBACK_TEXT_START_STATE,
  CHIP_TEST_COMPONENT,
  CHIP_TEXT,
} from '@fluentui-react-native/e2e-testing';
import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { Text } from '@fluentui-react-native/text';

import { testProps } from '../Common/TestProps';

export const E2EChipTest: React.FunctionComponent = () => {
  const [text, setText] = React.useState<string>(CHIP_CALLBACK_TEXT_START_STATE);
  const showTextOnSelection = React.useCallback(
    (_e: InteractionEvent, isSelected: boolean) => setText(isSelected ? CHIP_CALLBACK_TEXT_END_STATE : CHIP_CALLBACK_TEXT_START_STATE),
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
