import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { FAB } from './FAB';

const fontBuiltInProps = {
  fontFamily: 'Arial',
  codepoint: 0x2663,
  fontSize: 16,
};
const iconProps = { fontSource: { ...fontBuiltInProps }, color: '#fff' };

beforeAll(() => {
  jest.mock('react-native/Libraries/Utilities/Platform', () => ({
    OS: 'ios',
    select: () => null,
  }));
});

it('Default FAB (iOS)', () => {
  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(<FAB icon={iconProps}>Default FAB (iOS)</FAB>);
  });
  expect(component!.toJSON()).toMatchSnapshot();
});

it('Custom FAB with no shadow(iOS)', () => {
  const CustomFABNoShadow = FAB.customize({ shadowToken: undefined });
  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(<CustomFABNoShadow icon={iconProps}>Custom FAB with no shadow(iOS)</CustomFABNoShadow>);
  });
  expect(component!.toJSON()).toMatchSnapshot();
});

afterAll(() => {
  jest.unmock('react-native/Libraries/Utilities/Platform');
});
