import * as React from 'react';
import { RadioGroup, RadioButton } from '..';
import * as renderer from 'react-test-renderer';

function onChange(key: string) {
  console.log(key);
}

describe('RadioButton Tests', () => {
  it('RadioButton default', () => {
    const tree = renderer.create(<RadioButton content="Test" buttonKey="a" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Disabled RadioButton', () => {
    const tree = renderer.create(<RadioButton content="Test" buttonKey="b" disabled={true} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('RadioButton with all props', () => {
    const tree = renderer.create(<RadioButton content="Test" buttonKey="a" disabled={false} ariaLabel="Test ariaLabel" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('RadioButton with all props and tokens', () => {
    const TokenizedRadioButton = RadioButton.customize({
      tokens: { borderColor: 'blue', backgroundColor: 'black', color: 'red', fontSize: 18 }
    });
    const tree = renderer
      .create(<TokenizedRadioButton content="Test" buttonKey="a" disabled={false} ariaLabel="Test ariaLabel" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('RadioGroup + RadioButton Tests', () => {
  it('RadioGroup default', () => {
    const tree = renderer.create(<RadioGroup label="Test RadioGroup" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Tokenized RadioGroup default', () => {
    const TokenizedRadioGroup = RadioGroup.customize({ tokens: { fontSize: 18, color: 'blue' } });
    const tree = renderer.create(<TokenizedRadioGroup label="Test RadioGroup" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('RadioGroup with all props and default RadioButton', () => {
    const tree = renderer
      .create(
        <RadioGroup label="Test RadioGroup" defaultSelectedKey="a" ariaLabel="RadioGroup ariaLabel" onChange={onChange}>
          <RadioButton content="Test" buttonKey="a" />
        </RadioGroup>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('RadioGroup with all props and four default RadioButtons', () => {
    const tree = renderer
      .create(
        <RadioGroup label="This is a test RadioGroup" defaultSelectedKey="A" onChange={onChange}>
          <RadioButton content="Option A" buttonKey="A" ariaLabel="Cool" />
          <RadioButton content="Option B" buttonKey="B" />
          <RadioButton content="Option C" buttonKey="C" disabled={true} />
          <RadioButton content="Option D" buttonKey="D" />
        </RadioGroup>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
