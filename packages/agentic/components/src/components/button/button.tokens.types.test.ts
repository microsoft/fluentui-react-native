import type { ComponentTokenLayer } from '@fluentui-react-native/design';
import './button.styles';

it('registers Button slot and selector types on the public theme layer', () => {
  const valid: ComponentTokenLayer = {
    'furn.button': {
      root: { 'when.size.small': { 'when.visualState.pressed': { borderWidth: 3 } } },
      icon: { width: 18 },
    },
  };
  const wrongMember: ComponentTokenLayer = {
    // @ts-expect-error "huge" is not a Button size.
    'furn.button': { root: { 'when.size.huge': { borderWidth: 2 } } },
  };
  const wrongStyle: ComponentTokenLayer = {
    // @ts-expect-error Icon dimensions must be numbers.
    'furn.button': { icon: { width: '30%' } },
  };
  const repeatedAxis: ComponentTokenLayer = {
    // @ts-expect-error An axis cannot appear again inside its own branch.
    'furn.button': { root: { 'when.size.small': { 'when.size.medium': { borderWidth: 2 } } } },
  };
  const wrongEnum: ComponentTokenLayer = {
    // @ts-expect-error The shared borderStyle validator retains the React Native literal union.
    'furn.button': { root: { borderStyle: 'double' } },
  };
  expect([valid, wrongMember, wrongStyle, repeatedAxis, wrongEnum]).toHaveLength(5);
});
