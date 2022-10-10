import React from 'react';
import { View, Switch } from 'react-native';
import { FocusZoneDirection, FocusZone, Text } from '@fluentui/react-native';
import { RadioGroup, Radio } from '@fluentui-react-native/experimental-radio-group';
import { ButtonV1 as Button, ButtonProps } from '@fluentui-react-native/button';
import { commonTestStyles } from '../Common/styles';
import {
  FOCUSZONE_TEST_COMPONENT,
  FOCUSZONE_DIRECTION_ID,
  FOCUSZONE_TWO_DIM_SWITCH,
  FOCUSZONE_DISABLED_SWITCH,
  FOCUSZONE_CIRCLE_NAV_SWITCH,
  FOCUSZONE_DEFAULT_TABBABLE_SWITCH,
  FOCUSZONE_GRID_BEFORE,
  FOCUSZONE_GRID_AFTER,
  FOCUSZONE_GRID_BUTTON,
} from './consts';
import { focusZoneTestStyles, GridButton } from './styles';

export const FocusZoneDirections: FocusZoneDirection[] = ['bidirectional', 'horizontal', 'vertical', 'none'];

type FocusZoneListWrapperProps = {
  beforeID?: string;
  afterID?: string;
};
export const FocusZoneListWrapper: React.FunctionComponent<FocusZoneListWrapperProps> = ({ beforeID, afterID, children }) => {
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
  tabbableIdx?: number;
};

export const GridOfButtons: React.FunctionComponent<GridOfButtonsProps> = (props: GridOfButtonsProps) => {
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
                  componentRef={gridIndex === props.tabbableIdx ? props.tabRef : undefined}
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

export const FocusZone2D: React.FunctionComponent = () => {
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
          <GridOfButtons gridWidth={3} gridHeight={3} tabRef={tabbableRef} tabbableIdx={4} />
        </FocusZone>
      </FocusZoneListWrapper>
    </View>
  );
};
