import * as React from 'react';
import { View } from 'react-native';
import { RadioGroup, Radio } from '.';
import * as renderer from 'react-test-renderer';

describe('RadioButton component tests', () => {
  it('RadioButton default', () => {
    const tree = renderer.create(
      <RadioGroup label="Uncontrolled RadioGroup" defaultValue="key2">
        <Radio value="key1" label="RadioButton1" />
        <Radio value="key2" label="RadioButton2" />
      </RadioGroup>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('RadioButton not direct child of radio group', () => {
    const tree = renderer.create(
      <RadioGroup label="Uncontrolled RadioGroup" defaultValue="key2">
        <View>
          <Radio value="key1" label="RadioButton1" accessibilityPositionInSet={1} accessibilitySetSize={2} />
          <Radio value="key2" label="RadioButton2" accessibilityPositionInSet={2} accessibilitySetSize={2} />
        </View>
      </RadioGroup>,
    );

    expect(tree).toMatchSnapshot();
  });
});
