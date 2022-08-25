import { Theme } from '@fluentui-react-native/framework';
import { FocusTrapZone, Separator } from '@fluentui/react-native';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import * as React from 'react';
import { ScrollView, View, Platform, SafeAreaView, BackHandler } from 'react-native';
import { BASE_TESTPAGE } from './TestComponents/Common/consts';
import { fluentTesterStyles, mobileStyles } from './TestComponents/Common/styles';
import { useTheme } from '@fluentui-react-native/theme-types';
import { ThemePickers } from './theme/ThemePickers';
import { tests } from './testPages';
import { Shadow } from '@fluentui-react-native/experimental-shadow';

// uncomment the below lines to enable message spy
/**
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue';
MessageQueue.spy(true);
 */

const EmptyComponent: React.FunctionComponent = () => {
  return <Text variant={'heroStandard'}>Select a component from the left.</Text>;
};
export interface FluentTesterProps {
  initialTest?: string;
  enableSinglePaneView?: boolean;
}

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

const TestListItem = Button.customize((t) => ({
  subtle: {
    color: t.colors.neutralForeground1,
    shadowToken: undefined,
    hovered: {
      backgroundColor: t.colors.neutralBackground1Hover,
      color: t.colors.neutralForeground1,
      shadowToken: t.shadows.shadow8brand,
    },
    focused: {
      backgroundColor: t.colors.brandForeground1,
      color: t.colors.neutralForegroundInverted,
      shadowToken: t.shadows.shadow2brand,
    },
    pressed: {
      backgroundColor: t.colors.brandForeground1,
      color: t.colors.neutralForegroundInverted,
      shadowToken: t.shadows.shadow2brand,
    },
  },
}));

export const FluentTester: React.FunctionComponent<FluentTesterProps> = (props: FluentTesterProps) => {
  // filters and sorts tests alphabetically
  const filteredTestComponents = tests.filter((test) => test.platforms.includes(Platform.OS as string));
  const sortedTestComponents = filteredTestComponents.sort((a, b) => a.name.localeCompare(b.name));

  const { initialTest, enableSinglePaneView } = props;
  const initialSelectedTestIndex = sortedTestComponents.findIndex((description) => {
    return description.name === initialTest;
  });

  const [selectedTestIndex, setSelectedTestIndex] = React.useState(initialSelectedTestIndex);
  const [onTestListView, setOnTestListView] = React.useState(true);

  const onBackPress = () => {
    setOnTestListView(true);
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }
    return true;
  };

  const TestComponent = selectedTestIndex == -1 ? EmptyComponent : sortedTestComponents[selectedTestIndex].component;
  // const TestComponent = EmptyComponent;

  const themedStyles = getThemedStyles(useTheme());

  const RootView = Platform.select({
    ios: SafeAreaView,
    default: View,
  });

  const Header: React.FunctionComponent = () => {
    const theme = useTheme();

    return (
      <Shadow shadowToken={theme.shadows.shadow16brand}>
        <View
          style={[
            fluentTesterStyles.header,
            {
              backgroundColor: theme.colors.brandForeground1,
              borderRadius: 12,
              paddingTop: 8,
              paddingHorizontal: 16,
              paddingBottom: 14,
            },
          ]}
        >
          <Text testID={BASE_TESTPAGE} style={fluentTesterStyles.title} variant="heroLargeSemibold" color={'white'}>
            ⚛ FluentUI Tests
          </Text>
          <ThemePickers />
        </View>
      </Shadow>
    );
  };

  // iOS needs a software back button, which is shown on a newline along with the ThemePickers
  const MobileHeader: React.FunctionComponent = () => {
    const theme = useTheme();

    return (
      <View style={mobileStyles.header}>
        <Text
          style={[fluentTesterStyles.title]}
          variant="heroLargeSemibold"
          color={theme.host.palette?.TextEmphasis}
          testID={BASE_TESTPAGE}
        >
          ⚛ FluentUI Tests
        </Text>
        <View style={fluentTesterStyles.header}>
          {/* on iOS, display a back Button */}
          <Button
            appearance="subtle"
            style={{ alignSelf: 'flex-start', display: Platform.OS === 'ios' ? 'flex' : 'none' }}
            onClick={onBackPress}
            disabled={onTestListView}
          >
            ‹ Back
          </Button>
          <ThemePickers />
        </View>
      </View>
    );
  };

  const isTestListVisible = !enableSinglePaneView || (enableSinglePaneView && onTestListView);
  const isTestSectionVisible = !enableSinglePaneView || (enableSinglePaneView && !onTestListView);

  const TestList: React.FunctionComponent = () => {
    const theme = useTheme();
    return (
      <Shadow shadowToken={theme.shadows.shadow16}>
        <View style={[fluentTesterStyles.testList, { backgroundColor: theme.colors.neutralBackground6 }]}>
          <ScrollView contentContainerStyle={fluentTesterStyles.testListContainerStyle} testID="SCROLLVIEW_TEST_ID">
            {sortedTestComponents.map((description, index) => {
              return (
                <TestListItem
                  enableFocusRing={false}
                  appearance="subtle"
                  block
                  key={index}
                  pressed={index == selectedTestIndex}
                  onClick={() => setSelectedTestIndex(index)}
                  style={fluentTesterStyles.testListItem}
                  testID={description.testPage}
                >
                  {description.name}
                </TestListItem>
              );
            })}
          </ScrollView>
        </View>
      </Shadow>
    );
  };

  const MobileTestList: React.FunctionComponent = () => {
    return (
      <View style={{ ...mobileStyles.testList, display: isTestListVisible ? 'flex' : 'none' }}>
        <ScrollView contentContainerStyle={fluentTesterStyles.testListContainerStyle}>
          {sortedTestComponents.map((description, index) => {
            return (
              <View key={index}>
                <Text
                  key={index}
                  onPress={() => {
                    setOnTestListView(false);
                    setSelectedTestIndex(index);
                    if (Platform.OS === 'android') {
                      BackHandler.addEventListener('hardwareBackPress', onBackPress);
                    }
                  }}
                  style={mobileStyles.testListItem}
                  testID={description.testPage}
                >
                  {description.name}
                </Text>
                <Separator style={themedStyles.testSeparator} />
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const TestComponentView: React.FunctionComponent = () => {
    const theme = useTheme();
    return (
      <Shadow shadowToken={theme.shadows.shadow16}>
        <View
          style={[
            fluentTesterStyles.testComponentView,
            {
              backgroundColor: theme.colors.neutralBackground6,
            },
          ]}
        >
          <ScrollView>
            <TestComponent />
          </ScrollView>
        </View>
      </Shadow>
    );
  };

  const MobileTestComponentView: React.FunctionComponent = () => {
    return (
      <View style={{ ...mobileStyles.testSection, display: isTestSectionVisible ? 'flex' : 'none' }}>
        <ScrollView>
          <TestComponent />
        </ScrollView>
      </View>
    );
  };

  const TesterContent: React.FunctionComponent = () => {
    return (
      <View style={fluentTesterStyles.testRoot}>
        {enableSinglePaneView ? <MobileTestList /> : <TestList />}
        {enableSinglePaneView ? <MobileTestComponentView /> : <TestComponentView />}
      </View>
    );
  };

  return (
    <View style={fluentTesterStyles.root}>
      {Platform.OS === ('win32' as any) ? (
        <FocusTrapZone style={themedStyles.root}>
          {enableSinglePaneView ? <MobileHeader /> : <Header />}

          <TesterContent />
        </FocusTrapZone>
      ) : (
        <RootView style={themedStyles.root}>
          {enableSinglePaneView ? <MobileHeader /> : <Header />}

          <TesterContent />
        </RootView>
      )}
    </View>
  );
};
