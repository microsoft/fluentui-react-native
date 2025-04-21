import * as React from 'react';

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
  const tree = renderer.create(<FAB icon={iconProps}>Default FAB (iOS)</FAB>).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Custom FAB with no shadow(iOS)', () => {
  const CustomFABNoShadow = FAB.customize({ shadowToken: undefined });
  const tree = renderer.create(<CustomFABNoShadow icon={iconProps}>Custom FAB with no shadow(iOS)</CustomFABNoShadow>).toJSON();
  expect(tree).toMatchSnapshot();
});

afterAll(() => {
  jest.unmock('react-native/Libraries/Utilities/Platform');
});
