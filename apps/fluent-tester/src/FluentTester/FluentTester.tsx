import { Theme } from '@fluentui-react-native/framework';
import { StealthButton, Separator, Text } from '@fluentui/react-native';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { getHostSettingsWin32, useTheme } from '@uifabricshared/theming-react-native';
import * as React from 'react';
import { ScrollView, View, Text as RNText } from 'react-native';
import { Picker } from '@react-native-community/picker';
import { setAppColors } from './CustomThemes';
import { TestDescription } from './TestComponents';
import { BASE_TESTPAGE } from './TestComponents/Common/consts';
import { fluentTesterStyles } from './TestComponents/Common/styles';

// uncomment the below lines to enable message spy
/*
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue';
MessageQueue.spy(true);
*/

const EmptyComponent: React.FunctionComponent = () => {
  return <RNText style={fluentTesterStyles.noTest}>Select a component from the left.</RNText>;
};

export interface HeaderProps {
  setSelectedTheme: (theme?: string) => void;
  theme?: string;
}

export interface FluentTesterProps extends HeaderProps {
  initialTest?: string;
  enabledTests: TestDescription[];
}

const Header: React.FunctionComponent<HeaderProps> = (props: HeaderProps) => {
  const [selectedPlatform, setSelectedPlatform] = React.useState('win32');
  const [selectedApp, setSelectedApp] = React.useState('Office');
  const [selectedTheme, setSelectedTheme] = React.useState(props.theme === '' ? 'Default' : props.theme);

  const onAppChange = React.useCallback((appValue: string) => {
    setSelectedApp(appValue);
    setAppColors(appValue);
  }, []);

  const onThemeSelected = React.useCallback(
    (themeVal: string) => {
      if (themeVal !== null) {
        const val = themeVal === 'Default' ? '' : themeVal;
        props.setSelectedTheme(val);
        setSelectedTheme(themeVal);
      }
    },
    [props.setSelectedTheme, setSelectedTheme],
  );

  const hostColors = getHostSettingsWin32(useTheme())?.palette;

  return (
    <View style={fluentTesterStyles.header}>
      <Text style={[fluentTesterStyles.testHeader]} variant="heroLargeSemibold" color={hostColors?.TextEmphasis} testID={BASE_TESTPAGE}>
        ⚛ FluentUI Tests
      </Text>

      <View style={fluentTesterStyles.pickerRoot}>
        <View style={fluentTesterStyles.picker}>
          <RNText style={fluentTesterStyles.pickerLabel}>Platform: </RNText>
          <Picker
            selectedValue={selectedPlatform}
            style={fluentTesterStyles.dropdown}
            onValueChange={(platformValue) => setSelectedPlatform(platformValue.toString())}
          >
            <Picker.Item label="Win32" value="win32" />
            <Picker.Item label="UWP" value="uwp" />
            <Picker.Item label="iOS" value="ios" />
            <Picker.Item label="macOS" value="mac" />
            <Picker.Item label="Android" value="android" />
          </Picker>
        </View>

        <View style={fluentTesterStyles.picker}>
          <RNText style={fluentTesterStyles.pickerLabel}>App: </RNText>
          <Picker
            selectedValue={selectedApp}
            style={fluentTesterStyles.dropdown}
            onValueChange={(appValue) => onAppChange(appValue.toString())}
          >
            <Picker.Item label="Office" value="Office" />
            <Picker.Item label="Word" value="Word" />
            <Picker.Item label="Excel" value="Excel" />
            <Picker.Item label="PowerPoint" value="PowerPoint" />
            <Picker.Item label="Outlook" value="Outlook" />
          </Picker>
        </View>

        <View style={fluentTesterStyles.picker}>
          <RNText style={fluentTesterStyles.pickerLabel}>Theme: </RNText>
          <Picker
            selectedValue={selectedTheme}
            style={fluentTesterStyles.dropdown}
            onValueChange={(themeValue) => onThemeSelected(themeValue.toString())}
          >
            <Picker.Item label="TaskPane" value="Default" />
            <Picker.Item label="Caterpillar" value="Caterpillar" />
            <Picker.Item label="WhiteColors" value="WhiteColors" />
          </Picker>
        </View>
      </View>
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

  const { initialTest, setSelectedTheme, theme } = props;
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
      <Header setSelectedTheme={setSelectedTheme} theme={theme} />

      <Separator />

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
    </View>
  );
};
