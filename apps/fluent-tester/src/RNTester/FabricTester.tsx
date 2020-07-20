import { StealthButton } from '@fluentui-react-native/button';
import { Separator } from '@fluentui-react-native/separator';
import { Text } from '@fluentui-react-native/text';
import { useTheme } from '@uifabricshared/theming-react-native';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
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

  return (
    <View style={fabricTesterStyles.root}>
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