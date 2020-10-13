import * as React from 'react';
import { Button } from './Button';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

describe('Button component tests', () => {
  it('Button default', () => {
    const tree = renderer.create(<Button content="Default Button" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Button simple rendering does not invalidate styling', () => {
    checkRenderConsistency(() => <Button content="Default button" />, 2);
  });

  it('Button re-renders correctly', () => {
    checkReRender(() => <Button content="Render twice" />, 2);
  });

  it('Button shares produced styles across multiple renders', () => {
    const style = { backgroundColor: 'black' };
    checkRenderConsistency(() => <Button content="Shared styles" style={style} />, 2);
  });

  it('Button re-renders correctly with style', () => {
    const style = { borderColor: 'blue' };
    checkReRender(() => <Button content="Shared Style Render" style={style} />, 2);
  });
});
