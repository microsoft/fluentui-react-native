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
  const wrongOrder: ComponentTokenLayer = {
    // @ts-expect-error Size cannot appear inside a later visual-state branch.
    'furn.button': { root: { 'when.visualState.pressed': { 'when.size.small': { borderWidth: 2 } } } },
  };
  expect([valid, wrongMember, wrongStyle, wrongOrder]).toHaveLength(4);
});
