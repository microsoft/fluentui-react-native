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
      .create(
        <Checkbox
          label="All Props Checkbox"
          onChange={onChange}
          defaultChecked={true}
          labelPosition="before"
          disabled
          circular
          size="large"
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
      checkmarkColor: 'pink',
      checkmarkOpacity: 0.7,
      backgroundColor: 'purple',
      color: 'yellow',
      spacingLabelAfter: 7,
      borderColor: 'green',
      borderRadius: 4,
      borderWidth: 1,
    });
    const tree = renderer.create(<BoldCheckbox label="All Tokens Checkbox" onChange={onChange} defaultChecked={false} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
