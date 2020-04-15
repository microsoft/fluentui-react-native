import * as React from 'react';
import { Checkbox } from '..';
import * as renderer from 'react-test-renderer';

function onChange(val: boolean) {
  console.log(val);
}

it('Checkbox default', () => {
  const tree = renderer.create(<Checkbox />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Uncontrolled Checkbox with label ', () => {
  const tree = renderer.create(<Checkbox label="Test" defaultChecked={false} onChange={onChange} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Controlled Checkbox with label ', () => {
  const tree = renderer.create(<Checkbox label="Test" checked={false} onChange={onChange} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Uncontrolled Checkbox with label and ariaLabel ', () => {
  const tree = renderer.create(<Checkbox label="Test" defaultChecked={false} onChange={onChange} ariaLabel="Aria label" />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Uncontrolled Checkbox with boxside=end', () => {
  const tree = renderer.create(<Checkbox label="Test" defaultChecked={false} onChange={onChange} boxSide="end" />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Disabled Checkbox ', () => {
  const tree = renderer.create(<Checkbox label="Test" defaultChecked={false} disabled={true} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Uncontrolled Checkbox with all Tokens ', () => {
  const TokenizedCheckbox = Checkbox.customize({
    tokens: { borderRadius: 50, checkboxBackgroundColor: 'white' },
    _overrides: {
      checked: {
        tokens: {
          checkboxBackgroundColor: 'green',
          checkboxBorderColor: 'green',
          checkmarkColor: 'white'
        }
      },
      focused: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundHovered' } },
      hovered: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundHovered' } },
      pressed: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundPressed' } }
    }
  });
  const tree = renderer.create(<TokenizedCheckbox label="Test" defaultChecked={false} onChange={onChange} />).toJSON();
  expect(tree).toMatchSnapshot();
});
