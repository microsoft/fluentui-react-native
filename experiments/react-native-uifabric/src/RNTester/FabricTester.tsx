import * as React from 'react';
import { ScrollView, Image } from 'react-native';
import { StealthButton, Text, Separator } from '../components';
import { registerThemes } from './CustomThemes';
import { allTestComponents } from './TestComponents';
import { ViewWin32 } from '@office-iss/react-native-win32';
import { fabricTesterStyles } from './styles';

const logo = require('./images/fluent-ui-logo.png');

// uncomment the below lines to enable message spy
/*
const msgq = require('MessageQueue');
msgq.spy(true);
*/

registerThemes();

const EmptyComponent: React.FunctionComponent = () => {
  return (
    <Text fontSize={14} style={fabricTesterStyles.noTest}>
      Select a component from the left.
    </Text>
  );
};

// sort tests alphabetically by name
const sortedTestComponents = allTestComponents.sort((a, b) => a.name.localeCompare(b.name));

const TestListSeparator = Separator.customize({
  tokens: {
    color: 'darkGray',
    separatorWidth: 2
  }
});

export interface IFabricTesterProps {
  initialTest?: string;
}

export const FabricTester: React.FunctionComponent<IFabricTesterProps> = props => {
  const { initialTest } = props;
  const initialSelectedTestIndex = sortedTestComponents.findIndex(description => {
    return description.name === initialTest;
  });

  const [selectedTestIndex, setSelectedTestIndex] = React.useState(initialSelectedTestIndex);

  const TestComponent = selectedTestIndex == -1 ? EmptyComponent : sortedTestComponents[selectedTestIndex].component;

  return (
    <ViewWin32 style={fabricTesterStyles.root}>
      <ScrollView style={fabricTesterStyles.testList} contentContainerStyle={fabricTesterStyles.testListContainerStyle}>
        <ViewWin32 style={fabricTesterStyles.testHeader}>
          <Image source={logo} />
          <Text fontSize={14} fontWeight="bold">
            FluentUI Tests
          </Text>
        </ViewWin32>

        {sortedTestComponents.map((description, index) => {
          return (
            <StealthButton
              key={index}
              disabled={index == selectedTestIndex}
              content={description.name}
              onPress={() => setSelectedTestIndex(index)}
              style={fabricTesterStyles.testListItem}
            />
          );
        })}
      </ScrollView>

      <TestListSeparator vertical style={fabricTesterStyles.separator} />

      <ScrollView>
        <TestComponent />
      </ScrollView>
    </ViewWin32>
  );
};
