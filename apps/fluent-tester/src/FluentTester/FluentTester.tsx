import { Theme } from '@fluentui-react-native/framework';
import { StealthButton, Separator } from '@fluentui/react-native';
import { Text } from '@fluentui-react-native/experimental-text';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import * as React from 'react';
import { ScrollView, View, Text as RNText, Platform, SafeAreaView } from 'react-native';
import { TestDescription } from './TestComponents';
import { BASE_TESTPAGE } from './TestComponents/Common/consts';
import { fluentTesterStyles } from './TestComponents/Common/styles';
import { useTheme } from '@fluentui-react-native/theme-types';
import { ThemePickers } from './theme/ThemePickers';

// uncomment the below lines to enable message spy
/*
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue';
MessageQueue.spy(true);
*/

const EmptyComponent: React.FunctionComponent = () => {
  return <RNText style={fluentTesterStyles.noTest}>Select a component from the left.</RNText>;
};

export interface FluentTesterProps {
  initialTest?: string;
  enabledTests: TestDescription[];
}

const Header: React.FunctionComponent<{}> = () => {
  const theme = useTheme();
  const headerStyle = Platform.select({
    ios: fluentTesterStyles.headerIOS,
    default: fluentTesterStyles.header,
  });

  return (
    <View style={headerStyle}>
      <Text
        style={[fluentTesterStyles.testHeader]}
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

  const HeaderSeparator = Separator.customize((t) => ({
    color: t.colors.bodyFrameDivider,
    separatorWidth: 2,
  }));

  const TestListSeparator = Separator.customize((t) => ({
    color: t.colors.menuDivider,
    separatorWidth: 2,
  }));

  const themedStyles = getThemedStyles(useTheme());

  const RootView = Platform.select({
    ios: SafeAreaView,
    default: View,
  });

  return (
    <RootView style={themedStyles.root}>
      <Header />

      <HeaderSeparator />

      <View style={fluentTesterStyles.testRoot}>
        <ScrollView style={fluentTesterStyles.testList} contentContainerStyle={fluentTesterStyles.testListContainerStyle}>
          {sortedTestComponents.map((description, index) => {
            return (
              <StealthButton
                key={index}
                disabled={index == selectedTestIndex}
                content={description.name}
                onClick={() => setSelectedTestIndex(index)}
                style={fluentTesterStyles.testListItem}
                testID={description.testPage}
              />
            );
          })}
        </ScrollView>

        <TestListSeparator vertical style={{ marginHorizontal: 8, width: 2 }} />

        <View style={fluentTesterStyles.testSection}>
          <ScrollView>
            <TestComponent />
          </ScrollView>
        </View>
      </View>
    </RootView>
  );
};
