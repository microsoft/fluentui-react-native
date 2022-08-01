import * as React from 'react';
import { Radio } from './Radio';
import * as renderer from 'react-test-renderer';

describe('Radio component tests', () => {
  it('Radio default', () => {
    const tree = renderer.create(<Radio value="key1" label="Default Button" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
