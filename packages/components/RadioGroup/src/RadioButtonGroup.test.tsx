import * as React from 'react';
import { RadioGroup, RadioButton } from '.';
import * as renderer from 'react-test-renderer';

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
});
