import * as React from 'react';

import { ThemeTester } from '@fluentui-react-native/components/test';

import { useDesktopStorybookTestID } from './DesktopStorybookConfig';

export function StorybookThemeHost({ children }: React.PropsWithChildren) {
  const rootTestID = useDesktopStorybookTestID('app-root');
  const themeTestIDPrefix = useDesktopStorybookTestID('theme');

  return (
    <ThemeTester testID={rootTestID} testIDPrefix={themeTestIDPrefix}>
      {children}
    </ThemeTester>
  );
}
