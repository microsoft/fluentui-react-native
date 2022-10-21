import React from 'react';
import { View } from 'react-native';
import { FocusZoneDirection, FocusZone, MenuButton, Text } from '@fluentui/react-native';
import { Switch } from '@fluentui-react-native/switch';
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
  FOCUSZONE_DIRECTION_PICKER,
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
  e2etesting?: boolean;
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
                  testID={props.e2etesting ? FOCUSZONE_GRID_BUTTON(gridIndex) : undefined}
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
        <MenuButton
          testID={FOCUSZONE_DIRECTION_PICKER}
          content={`Current direction: ${direction}`}
          menuItems={FocusZoneDirections.map((dir) => ({
            itemKey: dir,
            text: dir,
            testID: FOCUSZONE_DIRECTION_ID(dir),
          }))}
          onItemClick={(dir) => setDirection(dir as FocusZoneDirection)}
        />
        <Switch testID={FOCUSZONE_TWO_DIM_SWITCH} label="2D Navigation" checked={is2DNav} onChange={(_, checked) => set2dNav(checked)} />
        <Switch testID={FOCUSZONE_DISABLED_SWITCH} label="Disabled" checked={isDisabled} onChange={(_, checked) => setDisabled(checked)} />
        <Switch
          testID={FOCUSZONE_CIRCLE_NAV_SWITCH}
          label="Circular Navigation"
          checked={isCircularNav}
          onChange={(_, checked) => setIsCircularNav(checked)}
        />
        <Switch
          testID={FOCUSZONE_DEFAULT_TABBABLE_SWITCH}
          label="Use Default Tabbable Element"
          checked={useDeffaultTabbableElement}
          onChange={(_, checked) => setUseDeffaultTabbableElement(checked)}
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
          <GridOfButtons gridWidth={3} gridHeight={3} tabRef={tabbableRef} tabbableIdx={4} e2etesting />
        </FocusZone>
      </FocusZoneListWrapper>
    </View>
  );
};
