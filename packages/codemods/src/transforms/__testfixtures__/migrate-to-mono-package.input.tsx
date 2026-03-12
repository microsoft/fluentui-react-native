import * as React from 'react';

import { Button } from '@fluentui-react-native/button';
import type { SvgIconProps } from '@fluentui-react-native/icon';
import type { IFocusable } from '@fluentui-react-native/interactive-hooks';
import { Stack } from '@fluentui-react-native/stack';
import { Text } from '@fluentui-react-native/text';
import { Theme } from '@fluentui-react-native/theme-types';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { ThemeProvider } from '@fluentui-react-native/framework';
import { Shimmer } from '@fluentui-react-native/experimental-shimmer';
import { createThemedCompose } from '@uifabricshared/theming-react-native';
import { settings } from '@uifabricshared/themed-settings';

// Barrel imports — should be decomposed into per-package imports
import { ButtonV1, Separator, TextV1 as MyText } from '@fluentui/react-native';
import type { FocusZoneDirection, CheckboxProps } from '@fluentui/react-native';
import { FocusZone, MenuButton, useOnPressWithFocus } from '@fluentui/react-native';

// Packages NOT in the mono-package — these should stay unchanged
import { TestSection } from '@fluentui-react-native/e2e-testing';
import { something } from '@fluentui-react-native/scripts';

const someRequire = require('@fluentui-react-native/avatar');
const alsoTransform = require('@uifabricshared/foundation-compose');
const skipThis = require('@fluentui-react-native/e2e-testing');

export const Example: React.FunctionComponent = () => {
  return (
    <ThemeProvider>
      <Stack>
        <Button content="Hello" />
        <Text>World</Text>
        <Shimmer />
      </Stack>
    </ThemeProvider>
  );
};
