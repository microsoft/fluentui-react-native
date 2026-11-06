import type { SBUI } from '@storybook/react-native-ui-common';

import { StorybookStoryTheme } from './StorybookTheme';
import { StorybookUIComponent } from './StorybookUI';
import { useStorybookTheme } from './useStorybookTheme';

export const ThemedStorybookUI: SBUI = ({ children, ...props }) => {
  const theme = useStorybookTheme();
  return (
    <StorybookUIComponent {...props} theme={theme}>
      <StorybookStoryTheme>{children}</StorybookStoryTheme>
    </StorybookUIComponent>
  );
};
