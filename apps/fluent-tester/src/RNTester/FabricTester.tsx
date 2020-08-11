import { StealthButton } from '@fluentui-react-native/button';
import { Separator } from '@fluentui-react-native/separator';
import { useTheme } from '@uifabricshared/theming-react-native';
import * as React from 'react';
import { Picker, ScrollView, View, Text } from 'react-native';
import { TestDescription } from './TestComponents';
import { BASE_TESTPAGE } from './TestComponents/Common/consts';
import { fabricTesterStyles } from './TestComponents/Common/styles';
import { registerThemes } from './TestComponents/Theme/CustomThemes';

// uncomment the below lines to enable message spy
/*
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue';
MessageQueue.spy(true);
*/

registerThemes();

export const [selectedPlatform, setSelectedPlatform] = React.useState("win32");
export const [selectedApp, setSelectedApp] = React.useState("office");
export const [selectedTheme, setSelectedTheme] = React.useState("default");

const EmptyComponent: React.FunctionComponent = () => {
  return <Text style={fabricTesterStyles.noTest}>Select a component from the left.</Text>;
};

export interface IFabricTesterProps {
  initialTest?: string;
  enabledTests: TestDescription[];
}

export const FabricTester: React.FunctionComponent<IFabricTesterProps> = (props: IFabricTesterProps) => {

  // sort tests alphabetically by name
  const sortedTestComponents = props.enabledTests.sort((a, b) => a.name.localeCompare(b.name));

  const { initialTest } = props;
  const initialSelectedTestIndex = sortedTestComponents.findIndex(description => {
    return description.name === initialTest;
  });

  const [selectedTestIndex, setSelectedTestIndex] = React.useState(initialSelectedTestIndex);

  const TestComponent = selectedTestIndex == -1 ? EmptyComponent : sortedTestComponents[selectedTestIndex].component;

  const TestListSeparator = Separator.customize({
    tokens: {
      color: useTheme().colors.inputBorder,
      separatorWidth: 2
    }
  });

  const onAppChange = React.useCallback((app: string) => {
    setSelectedApp(app);
  }, []);

  return (
    <View style={fabricTesterStyles.root}>
      <Picker
        selectedValue={selectedPlatform}
        style={{ height: 50, width: 150 }}
        onValueChange={(platformValue) => setSelectedPlatform(platformValue)}
      >
        <Picker.Item label="Win32" value="win32" />
        <Picker.Item label="UWP" value="uwp" />
        <Picker.Item label="iOS" value="ios" />
        <Picker.Item label="macOS" value="mac" />
        <Picker.Item label="Android" value="android" />
      </Picker>
      <Picker
        selectedValue={selectedApp}
        style={{ height: 50, width: 150 }}
        onValueChange={(appValue) => onAppChange(appValue)}
      >
        <Picker.Item label="Office" value="office" />
        <Picker.Item label="Word" value="word" />
        <Picker.Item label="Excel" value="excel" />
        <Picker.Item label="Powerpoint" value="ppt" />
        <Picker.Item label="Outlook" value="outlook" />
      </Picker>
      <Picker
        selectedValue={selectedTheme}
        style={{ height: 50, width: 150 }}
        onValueChange={(themeValue) => setSelectedTheme(themeValue)}
      >
        <Picker.Item label="Win32" value="win32" />
        <Picker.Item label="UWP" value="uwp" />
        <Picker.Item label="iOS" value="ios" />
        <Picker.Item label="macOS" value="mac" />
        <Picker.Item label="Android" value="android" />
      </Picker>

      <ScrollView style={fabricTesterStyles.testList} contentContainerStyle={fabricTesterStyles.testListContainerStyle}>
        <Text style={fabricTesterStyles.testHeader} testID={BASE_TESTPAGE}>
          ⚛ FluentUI Tests
        </Text>
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

      <TestListSeparator vertical style={fabricTesterStyles.separator} />

      <ScrollView>
        <TestComponent />
      </ScrollView>
    </View>
  );
};