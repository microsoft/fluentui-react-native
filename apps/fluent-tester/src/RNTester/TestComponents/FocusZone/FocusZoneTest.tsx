import * as React from 'react';
import { View, Picker, Switch } from 'react-native';
import { FocusZone, Button, Text, RadioGroup, RadioButton, FocusZoneDirection, NavigateAtEnd } from '@fluentui/react-native';
import { Test, TestSection, PlatformStatus } from '../Test';
import { FOCUSZONE_TESTPAGE } from './consts';
import { focusZoneTestStyles, stackStyleFocusZone } from './styles';
import { commonTestStyles } from '../Common/styles'
import { Stack } from '@fluentui-react-native/stack';

const navigation2DFocusZone: React.FunctionComponent<{}> = () => {
  const buttonRef = React.useRef<View>(null);

  // const onFocus = () => {
  //   console.group('hu');
  // }

  return (
    <View>
      <View>
        <Button content="Outside FocusZone" />
      </View>
      <FocusZone use2DNavigation={true} defaultTabbableElement={buttonRef} navigateAtEnd='NavigateWrap'>
        <View style={focusZoneTestStyles.focusZoneContainer}>
          <View style={focusZoneTestStyles.focusZoneViewStyle}>
            <Button content="#1" style={focusZoneTestStyles.focusZoneButton} />
            <Button content="#5" style={focusZoneTestStyles.focusZoneButton} />
            <Button content="#5" style={focusZoneTestStyles.focusZoneButton} />
          </View>
          <View style={focusZoneTestStyles.focusZoneViewStyle}>
            <Button style={focusZoneTestStyles.focusZoneButton} content="#2" />
            <Button componentRef={buttonRef} style={focusZoneTestStyles.focusZoneButton} content="Test" />
            <Button content="#5" style={focusZoneTestStyles.focusZoneButton} />
          </View>
          <View style={focusZoneTestStyles.focusZoneViewStyle}>
            <Button style={focusZoneTestStyles.focusZoneButton} content="#3" />
            <Button style={focusZoneTestStyles.focusZoneButton} content="Test" />
            <Button content="#5" style={focusZoneTestStyles.focusZoneButton} />
          </View>
        </View>
      </FocusZone>
      <View>
        <Button content="Outside FocusZone" />
      </View>
    </View >
  );
};

const commonUsageFocusZone: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <Button content="Outside FocusZone" />
      <FocusZone navigateAtEnd='NavigateWrap'>
        <RadioGroup label="FocusZone RadioGroup with Circular Navigation" defaultSelectedKey="A">
          <RadioButton content="Option A" buttonKey="A" ariaLabel="Cool" />
          <RadioButton content="Option B" buttonKey="B" />
          <RadioButton content="Option C" buttonKey="C" disabled={true} />
          <RadioButton content="Option D" buttonKey="D" />
        </RadioGroup>
      </FocusZone>
      <Button content="Outside FocusZone" />
      <FocusZone navigateAtEnd='NavigateStopAtEnds'>
        <RadioGroup label="FocusZone RadioGroup with Navigation stopAtEnd" defaultSelectedKey="A">
          <RadioButton content="Option A" buttonKey="A" ariaLabel="Cool" />
          <RadioButton content="Option B" buttonKey="B" />
          <RadioButton content="Option C" buttonKey="C" disabled={true} />
          <RadioButton content="Option D" buttonKey="D" />
        </RadioGroup>
      </FocusZone>
      <Button content="Outside FocusZone" />
      <FocusZone disabled={true}>
        <RadioGroup label="Disabled" defaultSelectedKey="A">
          <RadioButton content="Option A" buttonKey="A" ariaLabel="Cool" />
          <RadioButton content="Option B" buttonKey="B" />
          <RadioButton content="Option C" buttonKey="C" disabled={true} />
          <RadioButton content="Option D" buttonKey="D" />
        </RadioGroup>
      </FocusZone>
      <Button content="Outside FocusZone" />
      <FocusZone focusZoneDirection="none">
        <RadioGroup label="No arrow keys" defaultSelectedKey="A">
          <RadioButton content="Option A" buttonKey="A" ariaLabel="Cool" />
          <RadioButton content="Option B" buttonKey="B" />
          <RadioButton content="Option C" buttonKey="C" disabled={true} />
          <RadioButton content="Option D" buttonKey="D" />
        </RadioGroup>
      </FocusZone>
      <Button content="Outside FocusZone" />
    </View>
  )
};

const directionalFocusZone: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <Button content="Outside FocusZone" />
      <FocusZone disabled={null} focusZoneDirection='bidirectional'>
        <RadioGroup label="FocusZone RadioGroup with Bidirectional arrow key navigation" defaultSelectedKey="A">
          <RadioButton content="Option A" buttonKey="A" ariaLabel="Cool" />
          <RadioButton content="Option B" buttonKey="B" />
          <RadioButton content="Option C" buttonKey="C" disabled={true} />
          <RadioButton content="Option D" buttonKey="D" />
        </RadioGroup>
      </FocusZone>
      <Button content="Outside FocusZone" />
      <FocusZone focusZoneDirection='vertical'>
        <RadioGroup label="FocusZone RadioGroup with Vertical arrow key navigation" defaultSelectedKey="A">
          <RadioButton content="Option A" buttonKey="A" ariaLabel="Cool" />
          <RadioButton content="Option B" buttonKey="B" />
          <RadioButton content="Option C" buttonKey="C" disabled={true} />
          <RadioButton content="Option D" buttonKey="D" />
        </RadioGroup>
      </FocusZone>
      <Button content="Outside FocusZone" />
      <FocusZone focusZoneDirection='horizontal'>
        <RadioGroup label="FocusZone RadioGroup with Horizontal arrow key navigation" defaultSelectedKey="A">
          <RadioButton content="Option A" buttonKey="A" ariaLabel="Cool" />
          <RadioButton content="Option B" buttonKey="B" />
          <RadioButton content="Option C" buttonKey="C" disabled={true} />
          <RadioButton content="Option D" buttonKey="D" />
        </RadioGroup>
      </FocusZone>
      <Button content="Outside FocusZone" />
    </View>
  )
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

const focusZoneDirectionStrings = [
  'Bidirectional',
  'Horizontal',
  'Vertical',
  'None'
];

const navigateAtEndStrings = [
  'StopAtEnds',
  'Wrap',
  'Continue',
];


const customizableFocusZone: React.FunctionComponent<{}> = () => {
  const [is2DNav, set2dNav] = React.useState(false);
  const [isDisabled, setDisabled] = React.useState(false);
  const [isFocusZoneDirection, setFocusZoneDirection] = React.useState<FocusZoneDirection>('bidirectional');
  const [isNavigateAtEnd, setNavigateAtEnd] = React.useState<NavigateAtEnd>('NavigateStopAtEnds');

  return (
    <View style={commonTestStyles.root}>
      <Stack style={stackStyleFocusZone}>
        <View style={commonTestStyles.settings}>
          <SwitchWithLabel label="2D Navigation" value={is2DNav} onValueChange={set2dNav} />
          <SwitchWithLabel label="Disabled" value={isDisabled} onValueChange={setDisabled} />
          <Picker
            prompt="Direction"
            style={commonTestStyles.header}
            selectedValue="Bidirectional"
            onValueChange={(direction) => {
              switch (direction) {
                case 'Bidirectional':
                  setFocusZoneDirection('bidirectional');
                  break;
                case 'Horizontal':
                  setFocusZoneDirection('horizontal');
                  break;
                case 'Vertical':
                  setFocusZoneDirection('vertical');
                  break;
                case 'None':
                  setFocusZoneDirection('none');
                  break;
              }
            }}
          >
            {focusZoneDirectionStrings.map((direction, index) => (
              <Picker.Item label={direction} key={index} value={direction} />
            ))}
          </Picker>
          <Picker
            prompt="Navigation at End"
            style={commonTestStyles.header}
            selectedValue="StopAtEnds"
            onValueChange={(direction) => {
              switch (direction) {
                case 'Continue':
                  setNavigateAtEnd('NavigateContinue');
                  break;
                case 'StopAtEnds':
                  setNavigateAtEnd('NavigateStopAtEnds');
                  break;
                case 'Wrap':
                  setNavigateAtEnd('NavigateWrap');
                  break;
              }
            }}
          >
            {navigateAtEndStrings.map((direction, index) => (
              <Picker.Item label={direction} key={index} value={direction} />
            ))}
          </Picker>
        </View>

        <View>
          <Button content="Outside FocusZone" />
        </View>
        <FocusZone disabled={isDisabled} use2DNavigation={is2DNav} focusZoneDirection={isFocusZoneDirection} navigateAtEnd={isNavigateAtEnd} >
          <View style={focusZoneTestStyles.focusZoneContainer}>
            <View style={focusZoneTestStyles.focusZoneViewStyle}>
              <Button content="#1" style={focusZoneTestStyles.focusZoneButton} />
              <Button content="#5" style={focusZoneTestStyles.focusZoneButton} />
              <Button content="#5" style={focusZoneTestStyles.focusZoneButton} />
            </View>
            <View style={focusZoneTestStyles.focusZoneViewStyle}>
              <Button style={focusZoneTestStyles.focusZoneButton} content="#2" />
              <Button style={focusZoneTestStyles.focusZoneButton} content="Test" />
              <Button content="#5" style={focusZoneTestStyles.focusZoneButton} />
            </View>
            <View style={focusZoneTestStyles.focusZoneViewStyle}>
              <Button style={focusZoneTestStyles.focusZoneButton} content="#3" />
              <Button style={focusZoneTestStyles.focusZoneButton} content="Test" />
              <Button content="#5" style={focusZoneTestStyles.focusZoneButton} />
            </View>
          </View>
        </FocusZone>
        <View>
          <Button content="Outside FocusZone" />
        </View>
      </Stack>
    </View>
  )
}


const focusZoneSections: TestSection[] = [
  {
    name: 'Directional FocusZone Usage',
    testID: FOCUSZONE_TESTPAGE,
    component: directionalFocusZone,
  },
  {
    name: 'Common FocusZone Usage',
    component: commonUsageFocusZone
  },
  {
    name: '2D Navigation with Default Tabbable Element FocusZone Usage',
    component: navigation2DFocusZone
  },
  {
    name: 'Customizable FocusZone',
    component: customizableFocusZone
  }
];

export const FocusZoneTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description = 'No description.';

  return <Test name="FocusZone Test" description={description} sections={focusZoneSections} status={status}></Test>;
};