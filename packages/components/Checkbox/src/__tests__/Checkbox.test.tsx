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
    const tree = renderer.create(<Checkbox label="Default Checkbox" onChange={onChange} defaultChecked={false} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Checkbox no label', () => {
    const tree = renderer.create(<Checkbox onChange={onChange} defaultChecked={false} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Checkbox all props', () => {
    const tree = renderer
      .create(
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
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
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
    const tree = renderer.create(<BoldCheckbox label="All Tokens Checkbox" onChange={onChange} defaultChecked={false} />).toJSON();
    expect(tree).toMatchSnapshot();
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
    const tree = renderer.create(<ComposedCheckbox label="Composed Button with RNText" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
