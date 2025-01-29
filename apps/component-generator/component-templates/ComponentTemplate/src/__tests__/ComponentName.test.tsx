import * as React from 'react';
import { ComponentName } from '../ComponentName';
import * as renderer from 'react-test-renderer';

describe('ComponentName component tests', () => {
  it('ComponentName default', () => {
    const tree = renderer.create(<ComponentName>Your component</ComponentName>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  // Feel free to add more tests here
});
