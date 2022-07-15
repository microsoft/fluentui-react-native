import * as React from 'react';
import { Text } from 'react-native';
import { Shadow } from '../Shadow';
import { useFluentTheme } from '@fluentui-react-native/framework';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

interface ShadowTestProps {
  displayText: string;
  depth: string;
}

const TestShadow: React.FunctionComponent<ShadowTestProps> = (props: ShadowTestProps) => {
  const theme = useFluentTheme();
  return (
    <Shadow shadowToken={theme.shadows[props.depth]}>
      <Text>{props.displayText}</Text>
    </Shadow>
  );
};

describe('Shadow component tests', () => {
  it('Shadow (depth=2)', () => {
    const tree = renderer.create(<TestShadow displayText="Shadow (depth=2)" depth="shadow2" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow (depth=4)', () => {
    const tree = renderer.create(<TestShadow displayText="Shadow (depth=4)" depth="shadow4" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow (depth=8)', () => {
    const tree = renderer.create(<TestShadow displayText="Shadow (depth=8)" depth="shadow8" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow (depth=16)', () => {
    const tree = renderer.create(<TestShadow displayText="Shadow (depth=16)" depth="shadow16" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow (depth=28)', () => {
    const tree = renderer.create(<TestShadow displayText="Shadow (depth=28)" depth="shadow28" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow (depth=64)', () => {
    const tree = renderer.create(<TestShadow displayText="Shadow (depth=64)" depth="shadow64" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=2)', () => {
    const tree = renderer.create(<TestShadow displayText="Brand shadow (depth=2)" depth="shadow2brand" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=4)', () => {
    const tree = renderer.create(<TestShadow displayText="Brand shadow (depth=4)" depth="shadow4brand" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=8)', () => {
    const tree = renderer.create(<TestShadow displayText="Brand shadow (depth=8)" depth="shadow8brand" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=16)', () => {
    const tree = renderer.create(<TestShadow displayText="Brand shadow (depth=16)" depth="shadow16brand" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=28)', () => {
    const tree = renderer.create(<TestShadow displayText="Brand shadow (depth=28)" depth="shadow28brand" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=64)', () => {
    const tree = renderer.create(<TestShadow displayText="Brand shadow (depth=64)" depth="shadow64brand" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow simple rendering does not invalidate styling', () => {
    checkRenderConsistency(() => <TestShadow displayText="Shadow render test" depth="shadow2" />, 2);
  });

  it('Shadow re-renders correctly', () => {
    checkReRender(() => <TestShadow displayText="Shadow render twice test" depth="shadow2" />, 2);
  });
});
