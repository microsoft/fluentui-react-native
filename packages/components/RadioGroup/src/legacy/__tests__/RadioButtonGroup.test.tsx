import { act } from 'react';
import { View } from 'react-native';

import * as renderer from 'react-test-renderer';

import { RadioGroup, RadioButton } from '../..';

describe('RadioButton component tests', () => {
  it('RadioButton default', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <RadioGroup label="Uncontrolled RadioGroup" defaultSelectedKey="key2">
          <RadioButton buttonKey="key1" content="RadioButton1" />
          <RadioButton buttonKey="key2" content="RadioButton2" />
        </RadioGroup>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('RadioButton not direct child of radio group', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <RadioGroup label="Uncontrolled RadioGroup" defaultSelectedKey="key2">
          <View>
            <RadioButton buttonKey="key1" content="RadioButton1" accessibilityPosInSet={1} accessibilitySetSize={2} />
            <RadioButton buttonKey="key2" content="RadioButton2" accessibilityPosInSet={2} accessibilitySetSize={2} />
          </View>
        </RadioGroup>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});
