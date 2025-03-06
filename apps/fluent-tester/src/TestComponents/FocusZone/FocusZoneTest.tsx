import * as React from 'react';
import { View, ScrollView, Pressable, TextInput } from 'react-native';

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

const FocusZoneGrid: React.FunctionComponent = () => {
  const [isCircularNavigation, setCircularNavigation] = React.useState(true);
  const [tabNavigation, setTabNavigation] = React.useState<FocusZoneTabNavigation>('None');
  const onCircularNavigationChange = React.useCallback((_, isChecked: boolean) => setCircularNavigation(isChecked), []);

  return (
    <FocusZoneListWrapper>
      <>
        <Text>FocusZone Grid</Text>
        <Checkbox label="Circular Navigation" checked={isCircularNavigation} onChange={onCircularNavigationChange} />
        <MenuButton
          content={`Tab key navigation: ${tabNavigation}`}
          menuItems={FocusZoneTabNavigations.map((dir) => ({
            itemKey: dir,
            text: dir,
          }))}
          onItemClick={(dir) => setTabNavigation(dir as FocusZoneTabNavigation)}
        />
        <FocusZone isCircularNavigation tabKeyNavigation={tabNavigation}>
          <GridOfButtons gridWidth={3} gridHeight={3} />
        </FocusZone>
      </>
    </FocusZoneListWrapper>
  );
};

const FocusZoneTextInput: React.FunctionComponent = () => {
  return (
    <FocusZoneListWrapper>
      <>
        <Text>FocusZone Grid</Text>
        <FocusZone>
          <TextInput multiline={true} />
        </FocusZone>
      </>
    </FocusZoneListWrapper>
  );
};

export const FirstFocusTest = () => {
  const outerNormalRef = React.useRef(null);
  const innerNormalRef = React.useRef(null);
  const innerDirectRef = React.useRef(null);
  const innerFZRef = React.useRef(null);
  const outerNativeID = 'nativeIDToOuterButton';
  const innerNativeID = 'nativeIDToInnerButton';
  const innerDirectNativeID = 'nativeIDDirectToInnerButton';
  const [outerFocusZoneTabbableElement, setOuterFocusZoneTabbableElement] = React.useState<React.RefObject<View> | string>();
  const [innerFocusZoneTabbableElement, setInnerFocusZoneTabbableElement] = React.useState<React.RefObject<View> | string>();

  return (
    <FocusZone defaultTabbableElement={outerFocusZoneTabbableElement} tabKeyNavigation="Normal">
      <View>
        <Button onClick={() => setOuterFocusZoneTabbableElement(undefined)}>clear OuterFocusZone</Button>
        <Button componentRef={outerNormalRef} onClick={() => setOuterFocusZoneTabbableElement(outerNormalRef)}>
          Test ref
        </Button>
        <Button nativeID={outerNativeID} onClick={() => setOuterFocusZoneTabbableElement(outerNativeID)}>
          Test nativeId
        </Button>
      </View>
      <FocusZone componentRef={innerFZRef} defaultTabbableElement={innerFocusZoneTabbableElement}>
        <Button onClick={() => setInnerFocusZoneTabbableElement(undefined)}>clear InnerFocusZone</Button>
        <Button componentRef={innerDirectRef} onClick={() => setOuterFocusZoneTabbableElement(innerDirectRef)}>
          Test nested (direct ref)
        </Button>
        <Button nativeID={innerDirectNativeID} onClick={() => setOuterFocusZoneTabbableElement(innerDirectNativeID)}>
          Test nested (direct nativeID)
        </Button>
        <Button componentRef={innerNormalRef} onClick={() => setInnerFocusZoneTabbableElement(innerNormalRef)}>
          Test inner zone (ref)
        </Button>
        <Button nativeID={innerNativeID} onClick={() => setInnerFocusZoneTabbableElement(innerNativeID)}>
          Test inner zone (nativeID)
        </Button>
        <Button onClick={() => setOuterFocusZoneTabbableElement(innerFZRef)}>Test nested (transitive)</Button>
      </FocusZone>
    </FocusZone>
  );
};

const focusZoneSections: TestSection[] = [
  {
    name: 'First Focus FocusZone Usage',
    component: FirstFocusTest,
    testID: FOCUSZONE_TESTPAGE,
  },
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
  {
    name: 'FocusZone Grid',
    component: FocusZoneGrid,
  },
  {
    name: 'FocusZone with TextInput',
    component: FocusZoneTextInput,
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
    win32Status: 'Production',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Production',
    androidStatus: 'Backlog',
  };

  return (
    <Test name="FocusZone Test" description={'No description.'} sections={focusZoneSections} status={status} e2eSections={e2eSections} />
  );
};
