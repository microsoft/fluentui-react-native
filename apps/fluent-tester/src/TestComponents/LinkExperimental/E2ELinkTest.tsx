import * as React from 'react';
import { Link } from '@fluentui-react-native/experimental-link';
import { Stack } from '@fluentui-react-native/stack';
import { Text } from '@fluentui-react-native/text';
import { Button } from '@fluentui-react-native/experimental-button';
import { stackStyle } from '../Common/styles';
import {
  EXPERIMENTAL_LINK_TEST_COMPONENT,
  EXPERIMENTAL_LINK_ACCESSIBILITY_LABEL,
  EXPERIMENTAL_LINK_NO_A11Y_LABEL_COMPONENT,
  EXPERIMENTAL_LINK_TEST_COMPONENT_LABEL,
  EXPERIMENTAL_LINK_URL,
  EXPERIMENTAL_LINK_RESET_BUTTON,
  EXPERIMENTAL_LINK_CALLBACK_TEXT,
  EXPERIMENTAL_LINK_CALLBACK_VALUE,
  EXPERIMENTAL_LINK_DISABLED_COMPONENT,
} from './consts';

export const LinkE2ETest: React.FunctionComponent = () => {
  const [text, setText] = React.useState('');

  return (
    <Stack style={stackStyle}>
      <Link
        url={EXPERIMENTAL_LINK_URL}
        testID={EXPERIMENTAL_LINK_TEST_COMPONENT}
        accessibilityLabel={EXPERIMENTAL_LINK_ACCESSIBILITY_LABEL}
      >
        Link with Accessibility Label
      </Link>
      <Link onPress={() => setText(EXPERIMENTAL_LINK_CALLBACK_VALUE)} testID={EXPERIMENTAL_LINK_NO_A11Y_LABEL_COMPONENT}>
        {EXPERIMENTAL_LINK_TEST_COMPONENT_LABEL}
      </Link>
      <Text testID={EXPERIMENTAL_LINK_CALLBACK_TEXT}>{text}</Text>
      <Button testID={EXPERIMENTAL_LINK_RESET_BUTTON} onClick={() => setText('')}>
        Reset Callback
      </Button>
      <Link testID={EXPERIMENTAL_LINK_DISABLED_COMPONENT} disabled>
        Disabled link
      </Link>
    </Stack>
  );
};
