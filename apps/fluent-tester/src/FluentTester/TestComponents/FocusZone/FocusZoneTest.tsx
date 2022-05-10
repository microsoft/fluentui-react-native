import * as React from 'react';
import { View, Switch } from 'react-native';
import { FocusZone, Text, FocusZoneDirection, Checkbox } from '@fluentui/react-native';
import { ButtonV1 as Button, ButtonProps } from '@fluentui-react-native/button';
import { Test, TestSection, PlatformStatus } from '../Test';
import { FOCUSZONE_TESTPAGE } from './consts';
import { focusZoneTestStyles, GridButton, stackStyleFocusZone, SubheaderText } from './styles';
import { commonTestStyles } from '../Common/styles';
import { Stack } from '@fluentui-react-native/stack';
import { MenuButton, MenuButtonItemProps } from '@fluentui-react-native/experimental-menu-button';

const ListOfCheckboxes: React.FunctionComponent = () => {
  return (
    <React.Fragment>
      <Checkbox label="Option A" />
      <Checkbox label="Option B" />
      <Checkbox label="Option C" />
    </React.Fragment>
  );
};

const ListOfDisabledCheckboxes: React.FunctionComponent = () => {
  return (
    <React.Fragment>
      <Checkbox label="Option A" disabled={true} />
      <Checkbox label="Option B" disabled={true} />
      <Checkbox label="Option C" disabled={true} />
    </React.Fragment>
  );
};

const EdgeCasesFocusZone: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyleFocusZone}>
      <FocusZone>
        <SubheaderText>FocusZone with no focusable elements</SubheaderText>
        <ListOfDisabledCheckboxes />
      </FocusZone>
      <FocusZone>
        <SubheaderText>FocusZone with no props set</SubheaderText>
        <ListOfCheckboxes />
      </FocusZone>
      <FocusZone>
        <SubheaderText>FocusZone with no elements</SubheaderText>
      </FocusZone>
      <SubheaderText>Nested FocusZones</SubheaderText>
      <Button>Outside Focus Zone</Button>
      <Text>Parent FocusZone, vertical</Text>
      <View style={focusZoneTestStyles.nestedFocusZoneStyle}>
        <FocusZone focusZoneDirection="vertical">
          <Text>Inner FocusZone 1, horizontal</Text>
          <View style={focusZoneTestStyles.nestedFocusZoneStyle}>
            <FocusZone focusZoneDirection="horizontal">
              <View style={focusZoneTestStyles.focusZoneContainer}>
                {GridOfButtons({
                  gridWidth: 3,
                  gridHeight: 1,
                })}
              </View>
            </FocusZone>
          </View>
          <Text>Inner FocusZone 2, horizontal</Text>
          <View style={focusZoneTestStyles.nestedFocusZoneStyle}>
            <FocusZone focusZoneDirection="horizontal">
              <View style={focusZoneTestStyles.focusZoneContainer}>
                {GridOfButtons({
                  gridWidth: 3,
                  gridHeight: 1,
                })}
              </View>
            </FocusZone>
          </View>
          <Button>Inside Focus Zone</Button>
        </FocusZone>
      </View>
      <Button>Outside Focus Zone</Button>
    </Stack>
  );
};

const FocusZoneListWrapper: React.FunctionComponent = (props) => {
  const buttonProps: ButtonProps = { children: 'Click to Focus', style: { marginVertical: 10 } };
  return (
    <React.Fragment>
      <Button {...buttonProps} />
      {React.Children.map(props.children, (child) => {
        return (
          <React.Fragment>
            {child}
            <Button {...buttonProps} />
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};

const FocusZoneDirections: FocusZoneDirection[] = ['bidirectional', 'horizontal', 'vertical', 'none'];

const DirectionalFocusZone: React.FunctionComponent = () => {
  return (
    <FocusZoneListWrapper>
      <FocusZone>
        <SubheaderText>FocusZone with no props set</SubheaderText>
        <ListOfCheckboxes />
      </FocusZone>
      {FocusZoneDirections.map((direction, index) => (
        <FocusZone key={index} focusZoneDirection={direction}>
          <SubheaderText>FocusZone with arrow key navigation: {direction}</SubheaderText>
          <ListOfCheckboxes />
        </FocusZone>
      ))}
    </FocusZoneListWrapper>
  );
};

const CommonUsageFocusZone: React.FunctionComponent = () => {
  return (
    <FocusZoneListWrapper>
      <FocusZone isCircularNavigation={true}>
        <SubheaderText>FocusZone with Circular Navigation</SubheaderText>
        <ListOfCheckboxes />
      </FocusZone>
      <FocusZone disabled={true}>
        <SubheaderText>Disabled FocusZone</SubheaderText>
        <ListOfCheckboxes />
      </FocusZone>
    </FocusZoneListWrapper>
  );
};

type GridOfButtonsProps = {
  gridWidth: number;
  gridHeight: number;
  buttonRefs?: React.RefObject<View>[];
  onClick?: (index: number) => void;
};

const GridOfButtons: React.FunctionComponent<GridOfButtonsProps> = (props: GridOfButtonsProps) => {
  return (
    <React.Fragment>
      {[...Array(props.gridHeight)].map((_value, heightIndex: number) => {
        return (
          <View key={heightIndex} style={focusZoneTestStyles.focusZoneViewStyle}>
            {[...Array(props.gridWidth)].map((_value, widthIndex: number) => {
              const gridIndex = heightIndex * props.gridWidth + widthIndex + 1;
              return (
                <GridButton
                  key={widthIndex}
                  style={focusZoneTestStyles.focusZoneButton}
                  componentRef={props?.buttonRefs?.[gridIndex]}
                  onClick={() => {
                    props?.onClick?.(gridIndex);
                  }}
                >
                  <Text>{gridIndex}</Text>
                </GridButton>
              );
            })}
          </View>
        );
      })}
    </React.Fragment>
  );
};

const Navigation2DFocusZone: React.FunctionComponent = () => {
  const [defaultTabbableElementIndex, setDefaultTabbableElementIndex] = React.useState<number | null>(5);
  const gridWidth = 3,
    gridHeight = 4;

  const refMemo = React.useMemo(
    () =>
      Array(gridWidth * gridHeight)
        .fill(null)
        .map(() => React.createRef<View>()),
    [gridWidth, gridHeight],
  );
  const buttonRefs = React.useRef(refMemo);
  const defaultTextNote = 'The defaultTabbableElement is ' + defaultTabbableElementIndex;
  return (
    <React.Fragment>
      <Text>{defaultTextNote}</Text>
      <Button onClick={() => setDefaultTabbableElementIndex(null)} style={{ marginTop: 10 }}>
        Clear defaultTabbableElement
      </Button>
      <FocusZoneListWrapper>
        <FocusZone
          use2DNavigation={true}
          defaultTabbableElement={defaultTabbableElementIndex ? buttonRefs.current[defaultTabbableElementIndex] : undefined}
          isCircularNavigation={true}
        >
          <View style={focusZoneTestStyles.focusZoneContainer}>
            {GridOfButtons({
              gridWidth: 3,
              gridHeight: 4,
              buttonRefs: buttonRefs.current,
              onClick: (index: number) => setDefaultTabbableElementIndex(index),
            })}
          </View>
        </FocusZone>
      </FocusZoneListWrapper>
    </React.Fragment>
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

const CustomizableFocusZone: React.FunctionComponent = () => {
  const [is2DNav, set2dNav] = React.useState(false);
  const [isDisabled, setDisabled] = React.useState(false);
  const [isCircularNav, setIsCircularNav] = React.useState(false);
  const [focusZoneDirection, setFocusZoneDirection] = React.useState<FocusZoneDirection>('bidirectional');
  const menuItems: MenuButtonItemProps[] = FocusZoneDirections.map((direction) => ({ itemKey: direction, text: direction }));

  return (
    <View style={commonTestStyles.root}>
      <Stack style={stackStyleFocusZone}>
        <View style={commonTestStyles.settings}>
          <SwitchWithLabel label="2D Navigation" value={is2DNav} onValueChange={set2dNav} />
          <SwitchWithLabel label="Disabled" value={isDisabled} onValueChange={setDisabled} />
          <SwitchWithLabel label="Circular Navigation" value={isCircularNav} onValueChange={setIsCircularNav} />
          <MenuButton
            content={focusZoneDirection}
            menuItems={menuItems}
            onItemClick={(direction) => setFocusZoneDirection(direction as FocusZoneDirection)}
            contextualMenu={{
              shouldFocusOnMount: true,
              shouldFocusOnContainer: true,
            }}
          />
        </View>

        <FocusZoneListWrapper>
          <FocusZone
            disabled={isDisabled}
            use2DNavigation={is2DNav}
            focusZoneDirection={focusZoneDirection}
            isCircularNavigation={isCircularNav}
          >
            <View style={focusZoneTestStyles.focusZoneContainer}>{GridOfButtons({ gridWidth: 3, gridHeight: 3 })}</View>
          </FocusZone>
        </FocusZoneListWrapper>
      </Stack>
    </View>
  );
};

const focusZoneSections: TestSection[] = [
  {
    name: 'Directional FocusZone Usage',
    testID: FOCUSZONE_TESTPAGE,
    component: DirectionalFocusZone,
  },
  {
    name: 'Common FocusZone Usage',
    component: CommonUsageFocusZone,
  },
  {
    name: '2D Navigation',
    component: Navigation2DFocusZone,
  },
  {
    name: 'Customizable FocusZone',
    component: CustomizableFocusZone,
  },
  {
    name: 'FocusZone Edge Cases',
    component: EdgeCasesFocusZone,
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
