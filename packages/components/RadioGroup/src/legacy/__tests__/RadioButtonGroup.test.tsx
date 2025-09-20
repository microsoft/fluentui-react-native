import { View } from 'react-native';

import * as renderer from 'react-test-renderer';

import { RadioGroup, RadioButton } from '../..';

describe('RadioButton component tests', () => {
  it('RadioButton default', () => {
    const tree = renderer.create(
      <RadioGroup label="Uncontrolled RadioGroup" defaultSelectedKey="key2">
        <RadioButton buttonKey="key1" content="RadioButton1" />
        <RadioButton buttonKey="key2" content="RadioButton2" />
      </RadioGroup>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('RadioButton not direct child of radio group', () => {
    const tree = renderer.create(
      <RadioGroup label="Uncontrolled RadioGroup" defaultSelectedKey="key2">
        <View>
          <RadioButton buttonKey="key1" content="RadioButton1" accessibilityPositionInSet={1} accessibilitySetSize={2} />
          <RadioButton buttonKey="key2" content="RadioButton2" accessibilityPositionInSet={2} accessibilitySetSize={2} />
        </View>
      </RadioGroup>,
    );

    expect(tree).toMatchSnapshot();
  });
});
