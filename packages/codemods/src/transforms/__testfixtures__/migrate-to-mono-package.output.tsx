import * as React from 'react';

import { Button } from 'fluentui-react-native/button';
import type { SvgIconProps } from 'fluentui-react-native/icon';
import type { IFocusable } from 'fluentui-react-native/interactive-hooks';
import { Stack } from 'fluentui-react-native/stack';
import { Text } from 'fluentui-react-native/text';
import { Theme } from 'fluentui-react-native/theme-types';
import { themedStyleSheet } from 'fluentui-react-native/themed-stylesheet';
import { ThemeProvider } from 'fluentui-react-native/framework';
import { Shimmer } from 'fluentui-react-native/experimental-shimmer';
import { createThemedCompose } from 'fluentui-react-native/theming-react-native';
import { settings } from 'fluentui-react-native/themed-settings';

import { ButtonV1 } from 'fluentui-react-native/button';
import { Separator } from 'fluentui-react-native/separator';
import { TextV1 as MyText } from 'fluentui-react-native/text';
import type { CheckboxProps } from 'fluentui-react-native/checkbox';
import type { FocusZoneDirection } from 'fluentui-react-native/focus-zone';
import { FocusZone } from 'fluentui-react-native/focus-zone';
import { useOnPressWithFocus } from 'fluentui-react-native/interactive-hooks';
import { MenuButton } from 'fluentui-react-native/menu-button';

// Packages NOT in the mono-package — these should stay unchanged
import { TestSection } from '@fluentui-react-native/e2e-testing';
import { something } from '@fluentui-react-native/scripts';

const someRequire = require('fluentui-react-native/avatar');
const alsoTransform = require('fluentui-react-native/foundation-compose');
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
