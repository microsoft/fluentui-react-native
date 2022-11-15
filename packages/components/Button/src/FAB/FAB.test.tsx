import * as React from 'react';
import { FAB } from './FAB';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';
import * as renderer from 'react-test-renderer';
import { SvgIconProps } from '@fluentui-react-native/icon';

const TestSvg = require('../../../../../apps/fluent-tester/src/FluentTester/test-data/test.svg');
const svgProps: SvgIconProps = {
  src: TestSvg,
  viewBox: '0 0 500 500',
};

beforeAll(() => {
  jest.mock('react-native/Libraries/Utilities/Platform', () => ({
    OS: 'ios',
    select: () => null,
  }));
});

it('Default FAB (iOS)', () => {
  const tree = renderer.create(<FAB icon={{ svgSource: svgProps }}>Default FAB (iOS)</FAB>).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Custom FAB with no shadow(iOS)', () => {
  const CustomFABNoShadow = FAB.customize({ shadowToken: undefined });
  const tree = renderer
    .create(<CustomFABNoShadow icon={{ svgSource: svgProps }}>Custom FAB with no shadow(iOS)</CustomFABNoShadow>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Button simple rendering does not invalidate styling', () => {
  checkRenderConsistency(() => <FAB icon={{ svgSource: svgProps }}>Default FAB</FAB>, 2);
});

it('FAB re-renders correctly', () => {
  checkReRender(() => <FAB icon={{ svgSource: svgProps }}>Render twice</FAB>, 2);
});

it('FAB shares produced styles across multiple renders', () => {
  const style = { backgroundColor: 'black' };
  checkRenderConsistency(
    () => (
      <FAB icon={{ svgSource: svgProps }} style={style}>
        Shared styles
      </FAB>
    ),
    2,
  );
});

it('FAB re-renders correctly with style', () => {
  const style = { borderColor: 'blue' };
  checkReRender(
    () => (
      <FAB icon={{ svgSource: svgProps }} style={style}>
        Shared Style Render
      </FAB>
    ),
    2,
  );
});

afterAll(() => {
  jest.unmock('react-native/Libraries/Utilities/Platform');
});
