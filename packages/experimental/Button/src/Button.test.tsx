import * as React from 'react';
import { Button } from './Button';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

describe('Button component tests', () => {
  it('Button default', () => {
    const tree = renderer.create(<Button>Default Button</Button>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Button simple rendering does not invalidate styling', () => {
    checkRenderConsistency(() => <Button>Default button</Button>, 2);
  });

  it('Button re-renders correctly', () => {
    checkReRender(() => <Button>Render twice</Button>, 2);
  });

  it('Button shares produced styles across multiple renders', () => {
    const style = { backgroundColor: 'black' };
    checkRenderConsistency(() => <Button style={style}>Shared styles</Button>, 2);
  });

  it('Button re-renders correctly with style', () => {
    const style = { borderColor: 'blue' };
    checkReRender(() => <Button style={style}>Shared Style Render</Button>, 2);
  });
});
