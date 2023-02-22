import * as React from 'react';
import { Button } from '../src/deprecated/Button';
import * as renderer from 'react-test-renderer';

export const buttonLegacyTest = () => {
  it('Button default', () => {
    const tree = renderer.create(<Button content="Default Button" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
};
