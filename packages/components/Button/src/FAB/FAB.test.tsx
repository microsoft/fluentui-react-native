import * as React from 'react';
import { FAB } from './FAB';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';
import * as renderer from 'react-test-renderer';

beforeAll(() => {
  jest.mock('react-native/Libraries/Utilities/Platform', () => ({
    OS: 'ios',
    select: () => null,
  }));
});

it('Default FAB (iOS)', () => {
  const tree = renderer.create(<FAB>Default FAB (iOS)</FAB>).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Button simple rendering does not invalidate styling', () => {
  checkRenderConsistency(() => <FAB>Default FAB</FAB>, 2);
});

it('FAB re-renders correctly', () => {
  checkReRender(() => <FAB>Render twice</FAB>, 2);
});

it('FAB shares produced styles across multiple renders', () => {
  const style = { backgroundColor: 'black' };
  checkRenderConsistency(() => <FAB style={style}>Shared styles</FAB>, 2);
});

it('FAB re-renders correctly with style', () => {
  const style = { borderColor: 'blue' };
  checkReRender(() => <FAB style={style}>Shared Style Render</FAB>, 2);
});

afterAll(() => {
  jest.unmock('react-native/Libraries/Utilities/Platform');
});
