import { Theme } from '@fluentui-react-native/framework';
import { FocusTrapZone, Separator, Text } from '@fluentui/react-native';
import { ButtonV1 as Button, ToggleButton } from '@fluentui-react-native/button';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import * as React from 'react';
import { ScrollView, View, Text as RNText, Platform, SafeAreaView, BackHandler, FlatList, ListRenderItemInfo } from 'react-native';
import { BASE_TESTPAGE } from './TestComponents/Common/consts';
import { fluentTesterStyles, mobileStyles } from './TestComponents/Common/styles';
import { useTheme } from '@fluentui-react-native/theme-types';
import { ThemePickers } from './theme/ThemePickers';
import { tests } from './testPages';
import { TestDescription } from './TestComponents';

// uncomment the below lines to enable message spy
/**
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue';
MessageQueue.spy(true);
 */

const EmptyComponent: React.FunctionComponent = () => {
  return <RNText style={fluentTesterStyles.noTest}>Select a component from the left.</RNText>;
};
export interface FluentTesterProps {
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

const TestListItem = Button.customize((t: Theme) => ({
  subtle: {
    color: t.colors.neutralForeground1,
    hovered: {
      color: t.colors.neutralForeground1Hover,
    },
    pressed: {
      backgroundColor: t.colors.brandForeground1,
      color: t.colors.neutralForegroundInverted,
    },
  },
}));

// filters and sorts tests alphabetically
const filteredTestComponents = tests.filter((test) => test.platforms.includes(Platform.OS as string));
const sortedTestComponents = filteredTestComponents.sort((a, b) => a.name.localeCompare(b.name));

export const FluentTester: React.FunctionComponent<FluentTesterProps> = (props: FluentTesterProps) => {
  const { enableSinglePaneView } = props;

  const [selectedTestIndex, setSelectedTestIndex] = React.useState(-1);
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

  // We can't use Platform.select because win32 isn't on there.. so we do this long check instead
  const RootView = Platform.OS === ('win32' as any) ? FocusTrapZone : Platform.OS === 'ios' ? SafeAreaView : View;

  const Header: React.FunctionComponent = () => {
    const theme = useTheme();

    return (
      <View style={fluentTesterStyles.header}>
        <Text
          testID={BASE_TESTPAGE}
          style={[fluentTesterStyles.testHeader]}
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
          style={[fluentTesterStyles.testHeader]}
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

  const listRef = React.useRef<FlatList>();

  const ListItem = React.memo((props: ListRenderItemInfo<TestDescription>) => {
    const { index, item } = props;

    const ref = React.useRef<View>();

    const isSelected = Platform.select({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore `isSelected` is a macOS only prop not in the TS definition yet
      macos: props.isSelected,
      default: index == selectedTestIndex,
    });

    React.useEffect(() => {
      if (isSelected) {
        ref.current.focus();
      }
    });

    const onPress = React.useCallback(() => {
      setSelectedTestIndex(index);
      // Platform.select({
      //   macos: listRef.current?.selectRowAtIndex(index),
      //   default: setSelectedTestIndex(index),
      // });
    }, [index]);

    const enableFocusRing = Platform.select({
      macos: false,
      default: false,
    });

    return (
      <TestListItem
        componentRef={ref}
        appearance={'subtle'}
        enableFocusRing={enableFocusRing}
        key={index}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore `pressed` is in ButtonTokens (not props), but can be set
        pressed={isSelected}
        onClick={onPress}
        style={fluentTesterStyles.testListItem}
        testID={item.testPage}
      >
        {item.name}
      </TestListItem>
    );
  });

  const TestList: React.FunctionComponent = () => {
    const keyboardNavigationPropsMacOS = {
      focusable: false,
      enableSelectionOnKeyPress: true,
      initialSelectedIndex: selectedTestIndex,
      onSelectionChanged: (info) => {
        setSelectedTestIndex(info.newSelection);
      },
    };
    return (
      <>
        <FlatList
          ref={listRef}
          data={sortedTestComponents}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore `ListItemComponent` is `renderItem` with support for hooks
          ListItemComponent={ListItem}
          {...(Platform.OS === 'macos' && keyboardNavigationPropsMacOS)}
          style={fluentTesterStyles.testList}
        />
        <TestListSeparator vertical style={fluentTesterStyles.testListSeparator} />
      </>
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

  return (
    <RootView style={themedStyles.root}>
      {enableSinglePaneView ? <MobileHeader /> : <Header />}
      <HeaderSeparator />
      <View style={fluentTesterStyles.testRoot}>
        {enableSinglePaneView ? <MobileTestList /> : <TestList />}
        {enableSinglePaneView ? <MobileTestComponentView /> : <TestComponentView />}
      </View>
    </RootView>
  );
};
