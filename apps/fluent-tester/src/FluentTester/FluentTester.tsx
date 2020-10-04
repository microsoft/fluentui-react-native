import { Theme } from '@fluentui-react-native/framework';
import { StealthButton, Separator } from '@fluentui/react-native';
import { Text } from '@fluentui-react-native/experimental-text';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import * as React from 'react';
import { ScrollView, View, Text as RNText } from 'react-native';
import { TestDescription } from './TestComponents';
import { BASE_TESTPAGE } from './TestComponents/Common/consts';
import { fabricTesterStyles } from './TestComponents/Common/styles';
import { useTheme } from '@fluentui-react-native/theme-types';
import { ThemePickers } from './theme/ThemePickers';

// uncomment the below lines to enable message spy
/*
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue';
MessageQueue.spy(true);
*/

const EmptyComponent: React.FunctionComponent = () => {
  return <RNText style={fabricTesterStyles.noTest}>Select a component from the left.</RNText>;
};

export interface FluentTesterProps {
  initialTest?: string;
  enabledTests: TestDescription[];
}

const Header: React.FunctionComponent<{}> = () => {
  const theme = useTheme();

  return (
    <View style={fabricTesterStyles.header}>
      <Text
        style={[fabricTesterStyles.testHeader]}
        variant="heroLargeSemibold"
        color={theme.host.palette?.TextEmphasis}
        testID={BASE_TESTPAGE}
      >
        ⚛ FluentUI Tests
      </Text>

      <ThemePickers />
    </View>
  );
};

const getThemedStyles = themedStyleSheet((t: Theme) => {
  return {
    root: {
      backgroundColor: t.colors.background,
      flex: 1,
      flexGrow: 1,
      flexDirection: 'column',
      minHeight: 550,
      minWidth: 300,
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      padding: 4,
    },
  };
});

export const FluentTester: React.FunctionComponent<FluentTesterProps> = (props: FluentTesterProps) => {
  // sort tests alphabetically by name
  const sortedTestComponents = props.enabledTests.sort((a, b) => a.name.localeCompare(b.name));

  const { initialTest } = props;
  const initialSelectedTestIndex = sortedTestComponents.findIndex((description) => {
    return description.name === initialTest;
  });

  const [selectedTestIndex, setSelectedTestIndex] = React.useState(initialSelectedTestIndex);

  const TestComponent = selectedTestIndex == -1 ? EmptyComponent : sortedTestComponents[selectedTestIndex].component;

  const TestListSeparator = Separator.customize((t) => ({
    color: t.colors.inputBorder,
    separatorWidth: 2,
  }));

  const themedStyles = getThemedStyles(useTheme());

  return (
    <View style={themedStyles.root}>
      <Header />

      <Separator />

      <View style={fabricTesterStyles.testRoot}>
        <ScrollView style={fabricTesterStyles.testList} contentContainerStyle={fabricTesterStyles.testListContainerStyle}>
          {sortedTestComponents.map((description, index) => {
            return (
              <StealthButton
                key={index}
                disabled={index == selectedTestIndex}
                content={description.name}
                onClick={() => setSelectedTestIndex(index)}
                style={fabricTesterStyles.testListItem}
                testID={description.testPage}
              />
            );
          })}
        </ScrollView>

        <TestListSeparator vertical style={{ marginHorizontal: 8, width: 2 }} />

        <View style={fabricTesterStyles.testSection}>
          <ScrollView>
            <TestComponent />
          </ScrollView>
        </View>
      </View>
    </View>
  );
};
