import * as React from 'react';
import { View, Switch } from 'react-native';

import { Text } from '@fluentui/react-native';
import { Expander } from '@fluentui-react-native/experimental-expander';
import { Stack } from '@fluentui-react-native/stack';

import { EXPANDER_TESTPAGE } from './consts';
import { stackStyle, commonTestStyles as commonStyles } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const CustomizedExpander = Expander.customize({
  headerBackground: '#9c9c9c',
  headerForeground: '#ffffff',
  contentBackground: '#c3c3c3',
  chevronBackground: '#ff7f7f',
  chevronForeground: '#ffffff',
  chevronPointerOverBackground: '#b5ffb2',
  chevronPointerOverForeground: '#bfbdbd',
  chevronPressedBackground: '#ffb2f4',
  chevronPressedForeground: '#912a2a',
  headerForegroundPointerOver: '#27f238',
  headerForegroundPressed: '#f227eb',
  headerBorderBrush: '#f22727',
  headerBorderPointerOverBrush: '#27f238',
  headerBorderPressedBrush: '#f227eb',
  contentBorderBrush: '#f227eb',
  headerBorderThickness: 2,
  chevronBorderBrush: '#f22727',
  chevronBorderPointerOverBrush: '#27f238',
  chevronBorderPressedBrush: '#f227eb',
  chevronBorderThickness: 2,
});

const ExpanderMainTest: React.FunctionComponent = () => {
  /** This test page has not yet been tested and does not currently build because
   * the react-native-test-app does not yet support WinUI 2.6
   * Filed issue in react-native-test-app: https://github.com/microsoft/react-native-test-app/issues/444
   */

  const [switchValue, setSwitchValue] = React.useState(false);
  const [expanderText, setExpanderText] = React.useState('Initial state');
  const onExpanding = () => {
    setExpanderText('Expanding event changed title');
  };
  const onCollapsing = () => {
    setExpanderText('Collapsing event changed title');
  };

  return (
    <Stack style={stackStyle}>
      <Text>expanded=true, expandDirection=up, and event functionality</Text>
      <Expander
        collapsedHeight={50}
        expandedHeight={100}
        expanded={true}
        expandDirection="up"
        onCollapsing={onExpanding}
        onExpanding={onCollapsing}
      >
        <Text>{expanderText}</Text>
        <Text>Text in the content</Text>
      </Expander>
      <Text>enabled = false</Text>
      <Expander collapsedHeight={50} expandedHeight={100} enabled={false}>
        <Text>User cannot interact with this control</Text>
        <Text>Content that you should not see</Text>
      </Expander>
      <Text>Multiple components in header and content</Text>
      <Expander collapsedHeight={64} expandedHeight={150}>
        <View style={{ flexDirection: 'row', width: 200, height: 62 }}>
          <View style={{ alignSelf: 'center' }}>
            <Text>Line one</Text>
            <Text>Line two</Text>
          </View>
          <Switch style={{ marginLeft: 'auto', marginTop: 12 }} value={switchValue} onValueChange={setSwitchValue} />
        </View>
        <View>
          <Text>First line of text</Text>
          <Text>Second line of text</Text>
        </View>
      </Expander>
      <Text>Customized Expander</Text>
      <CustomizedExpander collapsedHeight={50} expandedHeight={100}>
        <Text>Text in the header</Text>
        <Text>Text in the content</Text>
      </CustomizedExpander>
    </Stack>
  );
};

const BasicExpander: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <View style={commonStyles.root}>
        <Expander collapsedHeight={50} expandedHeight={100}>
          <Text>Text in the header</Text>
          <Text>Text in the content</Text>
        </Expander>
      </View>
    </Stack>
  );
};

const expanderSections: TestSection[] = [
  {
    name: 'BaseExpander',
    testID: EXPANDER_TESTPAGE,
    component: BasicExpander,
  },
  {
    name: 'Expander',
    testID: EXPANDER_TESTPAGE,
    component: ExpanderMainTest,
  },
];

export const ExpanderTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Experimental',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description =
    'Expander is a content control that displays components in the header and content. The control has an expanded and collapsed size. Expander is a native control implemented with WinUI 2.6 Expander.';

  return <Test name="Expander Test" description={description} sections={expanderSections} status={status}></Test>;
};
