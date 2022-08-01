import * as React from 'react';
import { Radio } from './Radio';
import * as renderer from 'react-test-renderer';

describe('RadioButton component tests', () => {
  it('RadioButton default', () => {
    const tree = renderer.create(<Radio value="key1" label="Default Button" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
