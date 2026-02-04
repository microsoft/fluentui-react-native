import { act } from 'react';
import { Text, View } from 'react-native';

import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { Svg } from 'react-native-svg';
import * as renderer from 'react-test-renderer';

import { Checkbox } from '../Checkbox';

function onChange(_e: InteractionEvent, isChecked: boolean) {
  console.log(isChecked);
}

describe('Checkbox component tests', () => {
  it('Checkbox default', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Checkbox label="Default Checkbox" onChange={onChange} defaultChecked={false} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Checkbox no label', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Checkbox onChange={onChange} defaultChecked={false} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Checkbox all props', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Checkbox
          label="All Props Checkbox"
          onChange={onChange}
          defaultChecked={true}
          labelPosition="before"
          disabled
          shape="circular"
          size="large"
          required
        />,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Checkbox all tokens', () => {
    const BoldCheckbox = Checkbox.customize({
      fontFamily: 'Wingdings',
      fontWeight: '900',
      fontSize: 20,
      checkboxBackgroundColor: 'blue',
      checkboxBorderColor: 'red',
      checkboxBorderRadius: 5,
      checkboxBorderWidth: 2,
      checkboxSize: 11,
      checkmarkColor: 'pink',
      checkmarkOpacity: 0.7,
      checkmarkSize: 7,
      backgroundColor: 'purple',
      color: 'yellow',
      spacingLabelAfter: 7,
      spacingLabelBefore: 9,
      borderColor: 'green',
      borderRadius: 4,
      borderWidth: 2,
    });
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<BoldCheckbox label="All Tokens Checkbox" onChange={onChange} defaultChecked={false} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Checkbox composed', () => {
    const ComposedCheckbox = Checkbox.compose({
      slots: {
        root: View,
        checkbox: View,
        checkmark: Svg,
        label: Text,
        required: Text,
      },
    });
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<ComposedCheckbox label="Composed Button with RNText" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});
