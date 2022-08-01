import * as React from 'react';
import { RadioButton } from './RadioButton';
import * as renderer from 'react-test-renderer';

describe('RadioButton component tests', () => {
  it('RadioButton default', () => {
    const tree = renderer.create(<RadioButton buttonKey="key1" content="Default Button" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
