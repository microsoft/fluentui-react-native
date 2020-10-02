import { Theme } from '@fluentui-react-native/framework';
import { StealthButton, Separator, Text } from '@fluentui/react-native';
import { themedStyleSheet } from '@uifabricshared/themed-stylesheet';
import * as React from 'react';
import { Picker, ScrollView, View, Text as RNText } from 'react-native';
import { switchTestTheme } from './theme/CustomThemes';
import { TestDescription } from './TestComponents';
import { BASE_TESTPAGE } from './TestComponents/Common/consts';
import { fabricTesterStyles } from './TestComponents/Common/styles';
import { useTheme } from '@fluentui-react-native/theme-types';
import { OfficeBrand } from './theme/getOfficeTheme';

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
  const [selectedPlatform, setSelectedPlatform] = React.useState('win32');
  const [selectedTheme, setSelectedTheme] = React.useState('Default');
  const [selectedBrand, setSelectedBrand] = React.useState('Office');

  const onAppChange = React.useCallback(
    (newBrand: OfficeBrand) => {
      setSelectedBrand(newBrand);
      switchTestTheme(selectedTheme, newBrand);
    },
    [selectedTheme, setSelectedBrand],
  );

  const onThemeSelected = React.useCallback(
    (newTheme: string) => {
      setSelectedTheme(newTheme);
      switchTestTheme(newTheme, selectedBrand);
    },
    [selectedBrand, setSelectedTheme],
  );

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

      <View style={fabricTesterStyles.pickerRoot}>
        <View style={fabricTesterStyles.picker}>
          <RNText style={fabricTesterStyles.pickerLabel}>Platform: </RNText>
          <Picker
            selectedValue={selectedPlatform}
            style={fabricTesterStyles.dropdown}
            onValueChange={(platformValue) => setSelectedPlatform(platformValue)}
          >
            <Picker.Item label="Win32" value="win32" />
            <Picker.Item label="UWP" value="uwp" />
            <Picker.Item label="iOS" value="ios" />
            <Picker.Item label="macOS" value="mac" />
            <Picker.Item label="Android" value="android" />
          </Picker>
        </View>

        <View style={fabricTesterStyles.picker}>
          <RNText style={fabricTesterStyles.pickerLabel}>App: </RNText>
          <Picker selectedValue={selectedBrand} style={fabricTesterStyles.dropdown} onValueChange={onAppChange}>
            <Picker.Item label="Office" value="Office" />
            <Picker.Item label="Word" value="Word" />
            <Picker.Item label="Excel" value="Excel" />
            <Picker.Item label="Powerpoint" value="Powerpoint" />
            <Picker.Item label="Outlook" value="Outlook" />
          </Picker>
        </View>

        <View style={fabricTesterStyles.picker}>
          <RNText style={fabricTesterStyles.pickerLabel}>Theme: </RNText>
          <Picker selectedValue={selectedTheme} style={fabricTesterStyles.dropdown} onValueChange={onThemeSelected}>
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
