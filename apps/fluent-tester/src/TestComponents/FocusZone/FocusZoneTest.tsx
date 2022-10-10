import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { FocusZone, FocusZoneDirection, Text } from '@fluentui/react-native';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Checkbox, CheckboxProps } from '@fluentui-react-native/experimental-checkbox';
import { Test, TestSection, PlatformStatus } from '../Test';
import { FOCUSZONE_TESTPAGE } from './consts';
import { focusZoneTestStyles, SubheaderText } from './styles';
import { FocusZone2D, FocusZoneDirections, FocusZoneListWrapper, GridOfButtons } from './FocusZoneE2ETest';
import { MenuPicker, CollectionItem } from '../Common/MenuPicker';

const directionCollection: CollectionItem[] = FocusZoneDirections.map((dir) => ({ label: dir, value: dir }));

const Checkboxes = (props: CheckboxProps) => {
  return (
    <View style={focusZoneTestStyles.dashedBorder}>
      <Checkbox label="Option A" {...props} />
      <Checkbox label="Option B" {...props} />
      <Checkbox label="Option C" {...props} />
    </View>
  );
};

const DirectionalFocusZone: React.FunctionComponent = () => {
  const [direction, setDirection] = React.useState<FocusZoneDirection>('none');

  return (
    <>
      <MenuPicker prompt="Direction" selected={direction} onChange={setDirection} collection={directionCollection} />
      <FocusZone focusZoneDirection={direction}>
        <Checkboxes />
      </FocusZone>
    </>
  );
};

const CommonUsageFocusZone: React.FunctionComponent = () => {
  return (
    <FocusZoneListWrapper>
      <FocusZone isCircularNavigation={true}>
        <SubheaderText>FocusZone with Circular Navigation</SubheaderText>
        <Checkboxes />
      </FocusZone>
      <FocusZone disabled={true}>
        <SubheaderText>Disabled FocusZone</SubheaderText>
        <Checkboxes />
      </FocusZone>
    </FocusZoneListWrapper>
  );
};

const FocusZoneInsideScrollView: React.FunctionComponent = () => {
  return (
    <FocusZoneListWrapper>
      <FocusZone focusZoneDirection="bidirectional">
        <View style={focusZoneTestStyles.dashedBorder}>
          <Button style={focusZoneTestStyles.listWrapperButton}>Inside Focus Zone</Button>
          <ScrollView
            focusable={false}
            style={focusZoneTestStyles.scrollViewStyle}
            contentContainerStyle={focusZoneTestStyles.scrollViewContentStyle}
            showsVerticalScrollIndicator={true}
          >
            <Button style={focusZoneTestStyles.scrollViewButton}>1</Button>
            <Button style={focusZoneTestStyles.scrollViewButton}>2</Button>
            <Button style={focusZoneTestStyles.scrollViewButton}>3</Button>
          </ScrollView>
        </View>
      </FocusZone>
    </FocusZoneListWrapper>
  );
};

const FocusZoneNoFocusableElements: React.FunctionComponent = () => {
  return (
    <FocusZone>
      <Checkboxes disabled />
    </FocusZone>
  );
};

const FocusZoneNoProps: React.FunctionComponent = () => {
  return (
    <FocusZone>
      <Checkboxes />
    </FocusZone>
  );
};

const NestedFocusZone: React.FunctionComponent = () => {
  return (
    <FocusZoneListWrapper>
      <>
        <Text>Parent FocusZone, vertical</Text>
        <View style={focusZoneTestStyles.nestedFocusZoneStyle}>
          <FocusZone focusZoneDirection="vertical">
            <Text>Inner FocusZone 1, horizontal</Text>
            <FocusZone focusZoneDirection="horizontal">
              <GridOfButtons gridWidth={3} gridHeight={1} />
            </FocusZone>
            <Text>Inner FocusZone 2, horizontal</Text>
            <FocusZone focusZoneDirection="horizontal">
              <GridOfButtons gridWidth={3} gridHeight={1} />
            </FocusZone>
            <Button>Inside Focus Zone</Button>
          </FocusZone>
        </View>
      </>
    </FocusZoneListWrapper>
  );
};

const focusZoneSections: TestSection[] = [
  {
    name: 'Common FocusZone Usage',
    component: CommonUsageFocusZone,
  },
  {
    name: 'Directional FocusZone Usage',
    component: DirectionalFocusZone,
  },
  {
    name: '2D Navigation',
    component: FocusZone2D,
    testID: FOCUSZONE_TESTPAGE,
  },
  {
    name: 'ScrollView inside FocusZone',
    component: FocusZoneInsideScrollView,
  },
  {
    name: 'FocusZone with no focusable components',
    component: FocusZoneNoFocusableElements,
  },
  {
    name: 'FocusZone with no props',
    component: FocusZoneNoProps,
  },
  {
    name: 'Nested FocusZone',
    component: NestedFocusZone,
  },
];

export const FocusZoneTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  return <Test name="FocusZone Test" description={'No description.'} sections={focusZoneSections} status={status} />;
};
