'use strict';

import * as React from 'react';
import { AppRegistry } from 'react-native';
import { FabricTester } from './FabricTester';
import { ThemeProvider } from '@uifabricshared/theming-react-native';
import { customRegistry } from './CustomThemes';

interface IRNTesterNavigationState {
  openExample?: string;
}

interface IRNTesterAppProps {
  exampleFromAppetizeParams: string;
}

class RNTesterApp extends React.Component<IRNTesterAppProps, IRNTesterNavigationState> {
  public render(): JSX.Element {
    return (
      <ThemeProvider registry={customRegistry}>
        <FabricTester />
      </ThemeProvider>
    );
  }

  public componentDidMount(): void {
    return;
  }
}

AppRegistry.registerComponent('RNTesterApp', () => RNTesterApp);

export = RNTesterApp;
