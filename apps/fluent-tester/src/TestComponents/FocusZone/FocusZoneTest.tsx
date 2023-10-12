import * as React from 'react';
import { View, ScrollView, Pressable } from 'react-native';

import type { FocusZoneDirection, FocusZoneTabNavigation } from '@fluentui/react-native';
import { FocusZone, MenuButton, Text, useOnPressWithFocus } from '@fluentui/react-native';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import type { CheckboxProps } from '@fluentui-react-native/experimental-checkbox';
import { Checkbox } from '@fluentui-react-native/experimental-checkbox';

import { FocusZone2D, FocusZoneDirections, FocusZoneListWrapper, FocusZoneTabNavigations, GridOfButtons } from './FocusZoneE2ETest';
import { focusZoneTestStyles, SubheaderText } from './styles';
import { FOCUSZONE_TESTPAGE } from '../../../../E2E/src/FocusZone/consts';
import type { CollectionItem } from '../Common/MenuPicker';
import { MenuPicker } from '../Common/MenuPicker';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

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

const FocusZoneTabNavigationComponent: React.FunctionComponent = () => {
  const [tabNavigation, setTabNavigation] = React.useState<FocusZoneTabNavigation>('None');

  return (
    <View>
      <Text>FocusZone Tab Navigation</Text>
      <MenuButton
        content={`Current tab key navigation: ${tabNavigation}`}
        menuItems={FocusZoneTabNavigations.map((dir) => ({
          itemKey: dir,
          text: dir,
        }))}
        onItemClick={(dir) => setTabNavigation(dir as FocusZoneTabNavigation)}
      />
      <FocusZone tabKeyNavigation={tabNavigation}>
        <Checkboxes />
      </FocusZone>
    </View>
  );
};

const TinyBox = () => {
  const ref = React.useRef<View>();
  const onPress = useOnPressWithFocus(ref, null);

  return <Pressable focusable style={focusZoneTestStyles.smallBoxStyle} ref={ref} onPress={onPress} />;
};

const WideBox = () => {
  const ref = React.useRef<View>();
  const onPress = useOnPressWithFocus(ref, null);

  return <Pressable focusable style={focusZoneTestStyles.wideBoxStyle} ref={ref} onPress={onPress} />;
};

const TinyText = () => {
  return (
    <Text selectable style={focusZoneTestStyles.smallBoxStyle}>
      Hi
    </Text>
  );
};

const WideText = () => {
  return (
    <Text selectable style={focusZoneTestStyles.wideBoxStyle}>
      Hello world
    </Text>
  );
};

const DifferentSizesTest: React.FunctionComponent = () => {
  return (
    <FocusZone focusZoneDirection="bidirectional">
      <View style={focusZoneTestStyles.dashedBorder}>
        <WideBox />
        <TinyBox />
        <WideBox />
        <TinyText />
        <WideText />
      </View>
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
    testID: FOCUSZONE_TESTPAGE,
  },
  {
    name: 'Directional FocusZone Usage',
    component: DirectionalFocusZone,
  },
  {
    name: 'FocusZone with Tab Key Abstraction',
    component: FocusZoneTabNavigationComponent,
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
    name: 'Different Sized Children',
    component: DifferentSizesTest,
  },
  {
    name: 'Nested FocusZone',
    component: NestedFocusZone,
  },
];

const e2eSections: TestSection[] = [
  {
    name: '2D Navigation + E2E Testing',
    component: FocusZone2D,
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

  return (
    <Test name="FocusZone Test" description={'No description.'} sections={focusZoneSections} status={status} e2eSections={e2eSections} />
  );
};
