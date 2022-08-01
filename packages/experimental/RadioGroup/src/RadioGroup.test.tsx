import * as React from 'react';
import { View } from 'react-native';
import { RadioGroup, Radio } from '.';
import * as renderer from 'react-test-renderer';

describe('RadioGroup component tests', () => {
  it('RadioGroup default', () => {
    const tree = renderer.create(
      <RadioGroup label="Uncontrolled RadioGroup" defaultValue="key2">
        <Radio value="key1" label="Radio1" />
        <Radio value="key2" label="Radio2" />
      </RadioGroup>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('Radio not direct child of RadioGroup', () => {
    const tree = renderer.create(
      <RadioGroup label="Uncontrolled RadioGroup" defaultValue="key2">
        <View>
          <Radio value="key1" label="Radio1" accessibilityPositionInSet={1} accessibilitySetSize={2} />
          <Radio value="key2" label="Radio2" accessibilityPositionInSet={2} accessibilitySetSize={2} />
        </View>
      </RadioGroup>,
    );

    expect(tree).toMatchSnapshot();
  });
});
