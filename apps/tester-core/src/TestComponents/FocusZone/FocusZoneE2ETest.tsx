import React from 'react';
import { Platform, View } from 'react-native';

import type { FocusZoneDirection, FocusZoneTabNavigation, IFocusable } from '@fluentui/react-native';
import { FocusZone, MenuButton, Text } from '@fluentui/react-native';
import type { ButtonProps } from '@fluentui-react-native/button';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import {
  FOCUSZONE_CIRCLE_NAV_SWITCH,
  FOCUSZONE_DEFAULT_TABBABLE_SWITCH,
  FOCUSZONE_DIRECTION_ID,
  FOCUSZONE_DIRECTION_PICKER,
  FOCUSZONE_DISABLED_SWITCH,
  FOCUSZONE_GRID_AFTER,
  FOCUSZONE_GRID_BEFORE,
  FOCUSZONE_GRID_BUTTON,
  FOCUSZONE_TEST_COMPONENT,
  FOCUSZONE_TWO_DIM_SWITCH,
} from '@fluentui-react-native/e2e-testing';
import type { GridButtonIndex } from '@fluentui-react-native/e2e-testing';
import { Switch } from '@fluentui-react-native/switch';

import { focusZoneTestStyles, GridButton } from './styles';
import { commonTestStyles } from '../Common/styles';
import { testProps } from '../Common/TestProps';

export const FocusZoneDirections: FocusZoneDirection[] = ['bidirectional', 'horizontal', 'vertical', 'none'];
export const FocusZoneTabNavigations: FocusZoneTabNavigation[] = ['None', 'NavigateWrap', 'NavigateStopAtEnds', 'Normal'];

// Buttons by default focus on click on Win32, but they don't on the Mac, so place focus explicitly for convenience
function useFocusOnClickForMac(): Partial<ButtonProps> {
  const componentRef = React.useRef<IFocusable>(null);
  const onClick = React.useCallback(() => componentRef.current?.focus(), [componentRef]);
  return Platform.OS === 'macos' ? { componentRef, onClick } : {};
}

type FocusZoneListWrapperProps = React.PropsWithChildren<{
  beforeID?: string;
  afterID?: string;
}>;
export const FocusZoneListWrapper: React.FunctionComponent<FocusZoneListWrapperProps> = ({ beforeID, afterID, children }) => {
  const buttonProps: ButtonProps = { children: 'Click to Focus', style: focusZoneTestStyles.listWrapperButton };
  return (
    <>
      <Button
        {...buttonProps}
        {...useFocusOnClickForMac()}
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(beforeID)}
      />
      {children}
      <Button
        {...buttonProps}
        {...useFocusOnClickForMac()}
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(afterID)}
      />
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
                  key={widthIndex}
                  style={focusZoneTestStyles.focusZoneButton}
                  componentRef={gridIndex === props.tabbableIdx ? props.tabRef : undefined}
                  /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
                  {...testProps(props.e2etesting ? FOCUSZONE_GRID_BUTTON(gridIndex as GridButtonIndex) : undefined)}
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
        <Text
          variant="subheaderSemibold"
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(FOCUSZONE_TEST_COMPONENT)}
        >
          FocusZone Direction
        </Text>
        <MenuButton
          content={`Current direction: ${direction}`}
          menuItems={FocusZoneDirections.map((dir) => ({
            itemKey: dir,
            text: dir,
            testID: FOCUSZONE_DIRECTION_ID(dir),
          }))}
          onItemClick={(dir) => setDirection(dir as FocusZoneDirection)}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(FOCUSZONE_DIRECTION_PICKER)}
        />
        <Switch
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(FOCUSZONE_TWO_DIM_SWITCH)}
          label="2D Navigation"
          checked={is2DNav}
          onChange={(_, checked) => set2dNav(checked)}
        />
        <Switch
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(FOCUSZONE_DISABLED_SWITCH)}
          label="Disabled"
          checked={isDisabled}
          onChange={(_, checked) => setDisabled(checked)}
        />
        <Switch
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(FOCUSZONE_CIRCLE_NAV_SWITCH)}
          label="Circular Navigation"
          checked={isCircularNav}
          onChange={(_, checked) => setIsCircularNav(checked)}
        />
        <Switch
          label="Use Default Tabbable Element"
          checked={useDeffaultTabbableElement}
          onChange={(_, checked) => setUseDeffaultTabbableElement(checked)}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(FOCUSZONE_DEFAULT_TABBABLE_SWITCH)}
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
