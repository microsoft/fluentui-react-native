import * as React from 'react';
import { Checkbox } from '../Checkbox';
import * as renderer from 'react-test-renderer';

function onChange(isChecked: boolean) {
  console.log(isChecked);
}

describe('Checkbox component tests', () => {
  it('Checkbox default', () => {
    const tree = renderer.create(<Checkbox label="Default Checkbox" onChange={onChange} defaultChecked={false} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Checkbox all props', () => {
    const tree = renderer
      .create(<Checkbox label="All Props Checkbox" onChange={onChange} defaultChecked={true} boxSide="end" disabled />)
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
      checkboxMarginEnd: 10,
      checkboxMarginStart: 8,
      checkmarkColor: 'pink',
      checkmarkVisibility: 0.7,
      textBorderColor: 'green',
      backgroundColor: 'purple',
      color: 'yellow',
    });
    const tree = renderer.create(<BoldCheckbox label="All Tokens Checkbox" onChange={onChange} defaultChecked={false} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
