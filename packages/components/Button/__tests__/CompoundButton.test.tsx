import * as React from 'react';
import { CompoundButton } from '../src/CompoundButton/CompoundButton';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';
import * as renderer from 'react-test-renderer';

export const compountButtonTests = () => {
  it('CompoundButton default', () => {
    const tree = renderer.create(<CompoundButton secondaryContent="sublabel">Default Button</CompoundButton>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Button simple rendering does not invalidate styling', () => {
    checkRenderConsistency(() => <CompoundButton>Default button</CompoundButton>, 2);
  });

  it('Button re-renders correctly', () => {
    checkReRender(() => <CompoundButton>Render twice</CompoundButton>, 2);
  });

  it('Button shares produced styles across multiple renders', () => {
    const style = { backgroundColor: 'black' };
    checkRenderConsistency(() => <CompoundButton style={style}>Shared styles</CompoundButton>, 2);
  });

  it('Button re-renders correctly with style', () => {
    const style = { borderColor: 'blue' };
    checkReRender(() => <CompoundButton style={style}>Shared Style Render</CompoundButton>, 2);
  });
};
