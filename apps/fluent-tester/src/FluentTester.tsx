import { Theme } from '@fluentui-react-native/framework';
import { Separator, Text } from '@fluentui/react-native';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import * as React from 'react';
import { ScrollView, View, Text as RNText, Platform, SafeAreaView, BackHandler } from 'react-native';
import { BASE_TESTPAGE, TESTPAGE_BUTTONS_SCROLLVIEWER } from './TestComponents/Common/consts';
import { commonTestStyles, fluentTesterStyles, mobileStyles } from './TestComponents/Common/styles';
import { useTheme } from '@fluentui-react-native/theme-types';
import { ThemePickers } from './theme/ThemePickers';
import { tests } from './testPages';
import { ROOT_VIEW } from '../../E2E/src/common/consts';

// uncomment the below lines to enable message spy
/**
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue';
MessageQueue.spy(true);
 */

const EmptyComponent: React.FunctionComponent = () => {
  return <RNText style={fluentTesterStyles.noTest}>Select a component from the left.</RNText>;
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
    testSeparator: {
      borderColor: t.colors.menuDivider,
      borderWidth: 0.1,
    },
  };
});

const HeaderSeparator = Separator.customize((t) => ({
  color: t.colors.bodyFrameDivider,
  separatorWidth: 2,
}));

const TestListSeparator = Separator.customize((t) => ({
  color: t.colors.menuDivider,
  separatorWidth: 2,
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

  const themedStyles = getThemedStyles(useTheme());

  // This is used to initially bring focus to the app on win32
  const focusOnMountRef = React.useRef<View>();

  React.useEffect(() => {
    if (Platform.OS === ('win32' as any)) {
      focusOnMountRef.current.focus();
    }
  }, []);

  const RootView = Platform.select({
    ios: SafeAreaView,
    default: View,
  });

  const Header: React.FunctionComponent = () => {
    const theme = useTheme();

    return (
      <View style={fluentTesterStyles.header}>
        <Text
          testID={BASE_TESTPAGE}
          style={fluentTesterStyles.testHeader}
          variant="heroLargeSemibold"
          color={theme.host.palette?.TextEmphasis}
        >
          ⚛ FluentUI Tests
        </Text>
        <ThemePickers />
      </View>
    );
  };

  // iOS needs a software back button, which is shown on a newline along with the ThemePickers
  const MobileHeader: React.FunctionComponent = () => {
    const theme = useTheme();

    return (
      <View style={mobileStyles.header}>
        <Text
          style={fluentTesterStyles.testHeader}
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
    return (
      <View style={fluentTesterStyles.testList}>
        <ScrollView contentContainerStyle={fluentTesterStyles.testListContainerStyle} testID={TESTPAGE_BUTTONS_SCROLLVIEWER}>
          {sortedTestComponents.map((description, index) => {
            return (
              <Button
                appearance="subtle"
                key={index}
                disabled={index == selectedTestIndex}
                onClick={() => setSelectedTestIndex(index)}
                style={fluentTesterStyles.testListItem}
                testID={description.testPage}
                // This ref so focus can be set on it when the app mounts in win32. Without this, focus won't be set anywhere.
                {...(index === 0 && { componentRef: focusOnMountRef })}
              >
                {description.name}
              </Button>
            );
          })}
        </ScrollView>

        <TestListSeparator vertical style={fluentTesterStyles.testListSeparator} />
      </View>
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
                  // Please read http://93days.me/testing-react-native-application/ to understand why we set accessibilityLabel here.
                  accessibilityLabel={description.testPage}
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
    return (
      <ScrollView style={fluentTesterStyles.testSection}>
        <TestComponent />
      </ScrollView>
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
      <View style={commonTestStyles.flex}>
        {enableSinglePaneView ? <MobileHeader /> : <Header />}

        <HeaderSeparator />

        <View style={fluentTesterStyles.testRoot}>
          {enableSinglePaneView ? <MobileTestList /> : <TestList />}
          {enableSinglePaneView ? <MobileTestComponentView /> : <TestComponentView />}
        </View>
      </View>
    );
  };

  return (
    // TODO: Figure out why making this view accessible breaks element querying on iOS.
    <View accessible={Platform.OS !== 'ios'} testID={ROOT_VIEW} style={commonTestStyles.flex}>
      <RootView style={themedStyles.root}>
        <TesterContent />
      </RootView>
    </View>
  );
};
