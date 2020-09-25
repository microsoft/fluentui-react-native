import * as React from 'react';
import { Button } from './Button';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency } from '@fluentui-react-native/test-tools';

describe('Button component tests', () => {
  it('Button default', () => {
    const tree = renderer.create(<Button content="Default Button" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Button simple rendering does not invalidate styling', () => {
    checkRenderConsistency(() => <Button content="Default button" />, 2);
  });
});
