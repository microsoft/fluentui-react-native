import { Theme } from '@fluentui-react-native/framework';
import { Separator } from '@fluentui/react-native';
import { Text } from '@fluentui-react-native/experimental-text';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import * as React from 'react';
import { ScrollView, View, BackHandler } from 'react-native';
import { TestDescription } from './TestComponents';
import { BASE_TESTPAGE } from './TestComponents/Common/consts';
import { fluentTesterStyles, mobileStyles } from './TestComponents/Common/styles';
import { useTheme } from '@fluentui-react-native/theme-types';
import { ThemePickers } from './theme/ThemePickers';

// uncomment the below lines to enable message spy
/*
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue';
MessageQueue.spy(true);
*/

const DisplayIfVisible = ({ isVisible, children }) => (isVisible ? <View>{children}</View> : null);

export interface FluentTesterProps {
  initialTest?: string;
  enabledTests: TestDescription[];
}

const Header: React.FunctionComponent<{}> = () => {
  const theme = useTheme();

  return (
    <View style={{ ...fluentTesterStyles.header, flexDirection: 'column' }}>
      <Text style={[fluentTesterStyles.testHeader]} variant="heroSemibold" color={theme.host.palette?.TextEmphasis} testID={BASE_TESTPAGE}>
        ⚛ FluentUI Tests
      </Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <ThemePickers />
      </ScrollView>
    </View>
  );
};

const getThemedStyles = themedStyleSheet((t: Theme) => {
  return {
    root: {
      backgroundColor: t.colors.background,
      flexDirection: 'column',
      height: '100%',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      padding: 4,
    },
  };
});

export const FluentTester: React.FunctionComponent<FluentTesterProps> = (props: FluentTesterProps) => {
  // sort tests alphabetically by name
  const sortedTestComponents = props.enabledTests.sort((a, b) => a.name.localeCompare(b.name));

  const [selectedTestIndex, setSelectedTestIndex] = React.useState(0);
  const [onMainScreen, setOnMainScreen] = React.useState(true);

  const TestComponent = sortedTestComponents[selectedTestIndex].component;

  const themedStyles = getThemedStyles(useTheme());

  const onBackPress = () => {
    setOnMainScreen(true);
    BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    return true;
  };

  return (
    <DisplayIfVisible isVisible={true}>
      <DisplayIfVisible isVisible={onMainScreen}>
        <View style={themedStyles.root}>
          <Header />
          <Separator />
          <View style={{ ...fluentTesterStyles.testRoot, marginTop: 10 }}>
            <ScrollView style={fluentTesterStyles.testList} contentContainerStyle={fluentTesterStyles.testListContainerStyle}>
              {sortedTestComponents.map((description, index) => {
                return (
                  <View key={index}>
                    <Text
                      key={index}
                      onPress={() => {
                        setOnMainScreen(false);
                        setSelectedTestIndex(index);
                        BackHandler.addEventListener('hardwareBackPress', onBackPress);
                      }}
                      style={mobileStyles.testListItems}
                      testID={description.testPage}
                    >
                      {description.name}
                    </Text>
                    <Separator style={mobileStyles.testListSeparator} />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </DisplayIfVisible>
      <DisplayIfVisible isVisible={!onMainScreen}>
        <View style={themedStyles.root}>
          <Header />
          <Separator />
          <View style={{ ...fluentTesterStyles.testSection, flex: 1, width: '100%' }}>
            <ScrollView>
              <TestComponent />
            </ScrollView>
          </View>
        </View>
      </DisplayIfVisible>
    </DisplayIfVisible>
  );
};
