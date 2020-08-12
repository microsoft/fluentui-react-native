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

let app = 'office';

const EmptyComponent: React.FunctionComponent = () => {
  return <Text style={fabricTesterStyles.noTest}>Select a component from the left.</Text>;
};

export interface IFabricTesterProps {
  initialTest?: string;
  enabledTests: TestDescription[];
}

const Header: React.FunctionComponent<{}> = () => {

  const [selectedPlatform, setSelectedPlatform] = React.useState('win32');
  const [selectedApp, setSelectedApp] = React.useState('office');
  const [selectedTheme, setSelectedTheme] = React.useState('default');

  const onAppChange = React.useCallback((appValue: string) => {
    app = appValue;
    setSelectedApp(app);
  }, []);

  return (
    <View style={fabricTesterStyles.header}>
      <Text style={fabricTesterStyles.testHeader} testID={BASE_TESTPAGE}>
        ⚛ FluentUI Tests
      </Text>

      <View style={fabricTesterStyles.pickerRoot}>
        <View style={fabricTesterStyles.picker}>
          <Text style={fabricTesterStyles.pickerLabel}>Platform:  </Text>
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
          <Text style={fabricTesterStyles.pickerLabel}>App:  </Text>
          <Picker
            selectedValue={selectedApp}
            style={fabricTesterStyles.dropdown}
            onValueChange={(appValue) => onAppChange(appValue)}
          >
            <Picker.Item label="Office" value="office" />
            <Picker.Item label="Word" value="word" />
            <Picker.Item label="Excel" value="excel" />
            <Picker.Item label="Powerpoint" value="ppt" />
            <Picker.Item label="Outlook" value="outlook" />
          </Picker>
        </View>

        <View style={fabricTesterStyles.picker}>
          <Text style={fabricTesterStyles.pickerLabel}>Theme:  </Text>
          <Picker
            selectedValue={selectedTheme}
            style={fabricTesterStyles.dropdown}
            onValueChange={(themeValue) => setSelectedTheme(themeValue)}
          >
            <Picker.Item label="Default" value="default" />
            <Picker.Item label="Caterpillar" value="caterpillar" />
            <Picker.Item label="WhiteColors" value="white" />
          </Picker>
        </View>
      </View>
    </View>
  );
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

  return (
    <View style={fabricTesterStyles.root}>
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