import * as React from 'react';
import { Text, View } from 'react-native';
import { Shadow } from '../Shadow';
import { useFluentTheme } from '@fluentui-react-native/framework';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';
import { Notification } from '@fluentui-react-native/notification';
import { FAB } from '@fluentui-react-native/button';
import { Pressable } from '@fluentui-react-native/pressable';

interface ShadowTestProps {
  displayText: string;
  depth: string;
}

const TestShadow: React.FunctionComponent<ShadowTestProps> = (props: ShadowTestProps) => {
  const theme = useFluentTheme();
  return (
    <Shadow shadowToken={theme.shadows[props.depth]}>
      <View>
        <Text>{props.displayText}</Text>
      </View>
    </Shadow>
  );
};

const TestPressableWithShadow: React.FunctionComponent = () => {
  const theme = useFluentTheme();
  return (
    <Shadow shadowToken={theme.shadows['shadow16']}>
      <Pressable />
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

  it('Notification component that has a default shadow', () => {
    const tree = renderer
      .create(
        <Notification variant={'primary'} action="Undo">
          Mail Archived
        </Notification>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('FAB component that has a default shadow', () => {
    const tree = renderer.create(<FAB>Test FAB</FAB>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Pressable that has a shadow', () => {
    const tree = renderer.create(<TestPressableWithShadow />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow simple rendering does not invalidate styling', () => {
    checkRenderConsistency(() => <TestShadow displayText="Shadow render test" depth="shadow2" />, 2);
  });

  it('Shadow re-renders correctly', () => {
    checkReRender(() => <TestShadow displayText="Shadow render twice test" depth="shadow2" />, 2);
  });
});
