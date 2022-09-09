import * as React from 'react';
import { View, Switch, ScrollView } from 'react-native';
import { FocusZone, Text, FocusZoneDirection } from '@fluentui/react-native';
import { ButtonV1 as Button, ButtonProps } from '@fluentui-react-native/button';
import { Checkbox, CheckboxProps } from '@fluentui-react-native/experimental-checkbox';
import { Test, TestSection, PlatformStatus } from '../Test';
import { FOCUSZONE_TESTPAGE } from './consts';
import { focusZoneTestStyles, GridButton, SubheaderText } from './styles';
import { commonTestStyles } from '../Common/styles';
import { CollectionItem, MenuPicker } from '../Common/MenuPicker';

const FocusZoneDirections: FocusZoneDirection[] = ['bidirectional', 'horizontal', 'vertical', 'none'];
const directionCollection: CollectionItem<FocusZoneDirection>[] = FocusZoneDirections.map((x) => ({
  label: x,
  value: x,
}));

const Checkboxes = (props: CheckboxProps) => {
  return (
    <View style={focusZoneTestStyles.dashedBorder}>
      <Checkbox label="Option A" {...props} />
      <Checkbox label="Option B" {...props} />
      <Checkbox label="Option C" {...props} />
    </View>
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

const FocusZoneListWrapper = (props) => {
  const buttonProps: ButtonProps = { children: 'Click to Focus', style: focusZoneTestStyles.listWrapperButton };
  return (
    <>
      <Button {...buttonProps} />
      {React.Children.map(props.children, (child) => {
        return (
          <>
            {child}
            <Button {...buttonProps} />
          </>
        );
      })}
    </>
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

type GridOfButtonsProps = {
  gridWidth: number;
  gridHeight: number;
};

const GridOfButtons: React.FunctionComponent<GridOfButtonsProps> = (props: GridOfButtonsProps) => {
  return (
    <View style={focusZoneTestStyles.dashedBorder}>
      {[...Array(props.gridHeight)].map((_value, heightIndex: number) => {
        return (
          <View key={heightIndex} style={focusZoneTestStyles.focusZoneViewStyle}>
            {[...Array(props.gridWidth)].map((_value, widthIndex: number) => {
              const gridIndex = heightIndex * props.gridWidth + widthIndex + 1;
              return (
                <GridButton key={widthIndex} style={focusZoneTestStyles.focusZoneButton}>
                  <Text>{gridIndex}</Text>
                </GridButton>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

interface ISwitchWithLabelProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function SwitchWithLabel(props: ISwitchWithLabelProps): React.ReactElement {
  const { label, value, onValueChange } = props;
  return (
    <View style={commonTestStyles.switch}>
      <Text>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const FocusZone2D: React.FunctionComponent = () => {
  const [is2DNav, set2dNav] = React.useState(false);
  const [isDisabled, setDisabled] = React.useState(false);
  const [isCircularNav, setIsCircularNav] = React.useState(false);
  const [direction, setDirection] = React.useState<FocusZoneDirection>('bidirectional');

  return (
    <View style={commonTestStyles.root}>
      <View style={commonTestStyles.settings}>
        <SwitchWithLabel label="2D Navigation" value={is2DNav} onValueChange={set2dNav} />
        <SwitchWithLabel label="Disabled" value={isDisabled} onValueChange={setDisabled} />
        <SwitchWithLabel label="Circular Navigation" value={isCircularNav} onValueChange={setIsCircularNav} />
        <MenuPicker prompt="Direction" selected={direction} onChange={setDirection} collection={directionCollection} />
      </View>

      <FocusZoneListWrapper>
        <FocusZone disabled={isDisabled} use2DNavigation={is2DNav} focusZoneDirection={direction} isCircularNavigation={isCircularNav}>
          <GridOfButtons gridWidth={3} gridHeight={3} />
        </FocusZone>
      </FocusZoneListWrapper>
    </View>
  );
};

const focusZoneSections: TestSection[] = [
  {
    name: 'Common FocusZone Usage',
    component: CommonUsageFocusZone,
  },
  {
    name: 'Directional FocusZone Usage',
    testID: FOCUSZONE_TESTPAGE,
    component: DirectionalFocusZone,
  },
  {
    name: '2D Navigation',
    component: FocusZone2D,
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
