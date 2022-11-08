import { Theme } from '@fluentui-react-native/framework';
import { FocusTrapZone, Separator, Text } from '@fluentui/react-native';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import * as React from 'react';
import { ScrollView, View, Text as RNText, Platform, SafeAreaView, BackHandler } from 'react-native';
import { BASE_TESTPAGE, TESTPAGE_BUTTONS_SCROLLVIEWER } from './TestComponents/Common/consts';
import { commonTestStyles, fluentTesterStyles, mobileStyles } from './TestComponents/Common/styles';
import { useTheme } from '@fluentui-react-native/theme-types';
import { ThemePickers } from './theme/ThemePickers';
import { tests } from './testPages';
import { ROOT_VIEW } from './E2E/common/consts';

// uncomment the below lines to enable message spy
/**
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue';
MessageQueue.spy(true);
 */

export interface FluentTesterProps {
  enableSinglePaneView?: boolean;
}

interface HeaderProps {
  enableSinglePaneView?: boolean;
  showBackButton?: boolean;
  onBackButtonPressed?: () => void;
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

const EmptyComponent: React.FunctionComponent = () => {
  return <RNText style={fluentTesterStyles.noTest}>Select a component from the left.</RNText>;
};

const HeaderSeparator = Separator.customize((t) => ({
  color: t.colors.bodyFrameDivider,
  separatorWidth: 2,
}));

const TestListSeparator = Separator.customize((t) => ({
  color: t.colors.menuDivider,
  separatorWidth: 2,
}));

const Header: React.FunctionComponent<HeaderProps> = (props) => {
  const { enableSinglePaneView, showBackButton, onBackButtonPressed } = props;
  const theme = useTheme();

  const headerStyle = enableSinglePaneView ? fluentTesterStyles.headerWithBackButton : fluentTesterStyles.header;

  return (
    <View style={headerStyle}>
      <Text
        style={fluentTesterStyles.testHeader}
        variant="heroLargeSemibold"
        color={theme.host.palette?.TextEmphasis}
        testID={BASE_TESTPAGE}
      >
        ⚛ FluentUI Tests
      </Text>
      <View style={fluentTesterStyles.header}>
        {/* On iOS, We need a back button */}
        {Platform.OS === 'ios' && showBackButton && (
          <Button appearance="subtle" style={fluentTesterStyles.backButton} onClick={onBackButtonPressed}>
            ‹ Back
          </Button>
        )}
        <ThemePickers />
      </View>
    </View>
  );
};

// filters and sorts tests alphabetically
const filteredTestComponents = tests.filter((test) => test.platforms.includes(Platform.OS as string));
const sortedTestComponents = filteredTestComponents.sort((a, b) => a.name.localeCompare(b.name));

export const FluentTester: React.FunctionComponent<FluentTesterProps> = (props: FluentTesterProps) => {
  const { enableSinglePaneView } = props;

  const [selectedTestIndex, setSelectedTestIndex] = React.useState(-1);
  const [onTestListView, setOnTestListView] = React.useState(true);
  const theme = useTheme();
  const themedStyles = getThemedStyles(theme);

  const onBackPress = React.useCallback(() => {
    setOnTestListView(true);
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }
    return true;
  }, []);

  // We can't use Platform.select because win32 isn't on there.. so we do this long check instead
  const RootView = Platform.OS === ('win32' as any) ? FocusTrapZone : Platform.OS === 'ios' ? SafeAreaView : View;

  const TestComponent = selectedTestIndex == -1 ? EmptyComponent : sortedTestComponents[selectedTestIndex].component;

  const isTestSectionVisible = !enableSinglePaneView || (enableSinglePaneView && !onTestListView);

  const TestList: React.FunctionComponent = React.memo(() => {
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
              >
                {description.name}
              </Button>
            );
          })}
        </ScrollView>

        <TestListSeparator vertical style={fluentTesterStyles.testListSeparator} />
      </View>
    );
  });

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
      <ScrollView contentContainerStyle={fluentTesterStyles.testSection}>
        <TestComponent />
      </ScrollView>
    );
  };

  return (
    // TODO: Figure out why making this view accessible breaks element querying on iOS.
    <View accessible={Platform.OS !== 'ios'} testID={ROOT_VIEW} style={commonTestStyles.flex}>
      <RootView style={themedStyles.root}>
        <Header enableSinglePaneView={enableSinglePaneView} showBackButton={!onTestListView} onBackButtonPressed={onBackPress} />
        <HeaderSeparator />
        <View style={fluentTesterStyles.testRoot}>
          {enableSinglePaneView ? <MobileTestList /> : <TestList />}

          {isTestSectionVisible && <TestComponentView />}
        </View>
      </RootView>
    </View>
  );
};
