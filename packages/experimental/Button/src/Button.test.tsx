import * as React from 'react';
import { Button } from './Button';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

describe('Button component tests', () => {
  it('Button default', () => {
    const tree = renderer.create(<Button>Default Button</Button>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Button primary', () => {
    const tree = renderer.create(<Button appearance="primary">Primary Button</Button>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Button subtle', () => {
    const tree = renderer.create(<Button appearance="subtle">Subtle Button</Button>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Button circular', () => {
    const tree = renderer.create(<Button shape="circular">Circular Button</Button>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Button square', () => {
    const tree = renderer.create(<Button shape="square">Square Button</Button>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Button small', () => {
    const tree = renderer.create(<Button size="small">Small Button</Button>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Button large', () => {
    const tree = renderer.create(<Button size="large">Large Button</Button>).toJSON();
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
