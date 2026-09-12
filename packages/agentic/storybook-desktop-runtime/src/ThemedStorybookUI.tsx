import type { SBUI } from '@storybook/react-native-ui-common';

import { StorybookUIComponent } from './StorybookUI';
import { useStorybookTheme } from './useStorybookTheme';

export const ThemedStorybookUI: SBUI = (props) => {
  const theme = useStorybookTheme();
  return <StorybookUIComponent {...props} theme={theme} />;
};
