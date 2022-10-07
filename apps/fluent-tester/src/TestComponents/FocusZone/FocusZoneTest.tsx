import * as React from 'react';
import { View, Switch, ScrollView } from 'react-native';
import { FocusZone, Text, FocusZoneDirection } from '@fluentui/react-native';
import { ButtonV1 as Button, ButtonProps } from '@fluentui-react-native/button';
import { Checkbox, CheckboxProps } from '@fluentui-react-native/experimental-checkbox';
import { RadioGroup, Radio } from '@fluentui-react-native/experimental-radio-group';
import { Test, TestSection, PlatformStatus } from '../Test';
import {
  FOCUSZONE_CIRCLE_NAV_SWITCH,
  FOCUSZONE_DEFAULT_TABBABLE_SWITCH,
  FOCUSZONE_DIRECTION_ID,
  FOCUSZONE_DISABLED_SWITCH,
  FOCUSZONE_GRID_AFTER,
  FOCUSZONE_GRID_BEFORE,
  FOCUSZONE_GRID_BUTTON,
  FOCUSZONE_TESTPAGE,
  FOCUSZONE_TEST_COMPONENT,
  FOCUSZONE_TWO_DIM_SWITCH,
} from './consts';
import { focusZoneTestStyles, GridButton } from './styles';
import { commonTestStyles } from '../Common/styles';

const FocusZoneDirections: FocusZoneDirection[] = ['bidirectional', 'horizontal', 'vertical', 'none'];

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

type FocusZoneListWrapperProps = {
  beforeID?: string;
  afterID?: string;
};
const FocusZoneListWrapper: React.FunctionComponent<FocusZoneListWrapperProps> = ({ beforeID, afterID, children }) => {
  const buttonProps: ButtonProps = { children: 'Click to Focus', style: focusZoneTestStyles.listWrapperButton };
  return (
    <>
      <Button {...buttonProps} testID={beforeID} />
      {children}
      <Button {...buttonProps} testID={afterID} />
    </>
  );
};

type GridOfButtonsProps = {
  gridWidth: number;
  gridHeight: number;
  tabRef?: React.RefObject<View>;
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
                <GridButton
                  testID={FOCUSZONE_GRID_BUTTON(gridIndex)}
                  key={widthIndex}
                  style={focusZoneTestStyles.focusZoneButton}
                  componentRef={gridIndex === 4 ? props.tabRef : undefined}
                >
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
  testID?: string;
}

function SwitchWithLabel(props: ISwitchWithLabelProps): React.ReactElement {
  const { label, value, onValueChange, testID } = props;
  return (
    <View style={commonTestStyles.switch}>
      <Text>{label}</Text>
      <Switch testID={testID} value={value} onValueChange={onValueChange} />
    </View>
  );
}

const FocusZone2D: React.FunctionComponent = () => {
  const [is2DNav, set2dNav] = React.useState(false);
  const [isDisabled, setDisabled] = React.useState(false);
  const [isCircularNav, setIsCircularNav] = React.useState(false);
  const [useDeffaultTabbableElement, setUseDeffaultTabbableElement] = React.useState(false);
  const [direction, setDirection] = React.useState<FocusZoneDirection>('bidirectional');

  const tabbableRef = React.useRef(null);

  return (
    <View style={commonTestStyles.root}>
      <View style={commonTestStyles.settings}>
        <Text variant="subheaderSemibold" testID={FOCUSZONE_TEST_COMPONENT}>
          FocusZone Direction
        </Text>
        {/* Usage of RadioGroup over MenuPicker is because MenuPicker, from my experimentation, doesn't support automation. */}
        <RadioGroup style={focusZoneTestStyles.radioGroup} onChange={(dir) => setDirection(dir as FocusZoneDirection)} value={direction}>
          {FocusZoneDirections.map((direction, i) => (
            <Radio label={direction} value={direction} testID={FOCUSZONE_DIRECTION_ID(direction)} key={i} />
          ))}
        </RadioGroup>
        <SwitchWithLabel testID={FOCUSZONE_TWO_DIM_SWITCH} label="2D Navigation" value={is2DNav} onValueChange={set2dNav} />
        <SwitchWithLabel testID={FOCUSZONE_DISABLED_SWITCH} label="Disabled" value={isDisabled} onValueChange={setDisabled} />
        <SwitchWithLabel
          testID={FOCUSZONE_CIRCLE_NAV_SWITCH}
          label="Circular Navigation"
          value={isCircularNav}
          onValueChange={setIsCircularNav}
        />
        <SwitchWithLabel
          testID={FOCUSZONE_DEFAULT_TABBABLE_SWITCH}
          label="Use Default Tabbable Element"
          value={useDeffaultTabbableElement}
          onValueChange={setUseDeffaultTabbableElement}
        />
      </View>

      <FocusZoneListWrapper beforeID={FOCUSZONE_GRID_BEFORE} afterID={FOCUSZONE_GRID_AFTER}>
        <FocusZone
          disabled={isDisabled}
          use2DNavigation={is2DNav}
          focusZoneDirection={direction}
          isCircularNavigation={isCircularNav}
          defaultTabbableElement={useDeffaultTabbableElement ? tabbableRef : undefined}
        >
          <GridOfButtons gridWidth={3} gridHeight={3} tabRef={tabbableRef} />
        </FocusZone>
      </FocusZoneListWrapper>
    </View>
  );
};

const focusZoneSections: TestSection[] = [
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
