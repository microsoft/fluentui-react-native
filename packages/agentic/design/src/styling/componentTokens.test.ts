import { getThemeState } from '../flex/themeState';
import { FlexThemeReference } from '../flex/flexThemeReference';
import { resolveThemeAppearance } from '../theming/appearance';
import { defineComponentTokens, getComponentTokens, resolveTokenStates } from './componentTokens';

const axes = [
  ['selected', [false, true]],
  ['visualState', ['rest', 'hovered', 'pressed', 'disabled']],
] as const;
const stringValue = (value: unknown) => {
  if (typeof value !== 'string') throw new TypeError('expected a string');
  return value;
};
const slots = { root: { style: { color: stringValue, borderColor: stringValue }, props: {} } };
const schema = {
  schemaVersion: 2,
  component: 'example',
  axes,
  bindings: {
    root: {
      color: 'tokens:color.foregroundNeutralPrimary.active',
      'when.selected.true': {
        color: 'bold',
        'when.visualState.hovered': { color: 'selected hover' },
      },
      'when.visualState.hovered': { color: 'hover', borderColor: 'hover border' },
      'when.visualState.disabled': { color: 'disabled' },
    },
  },
};

declare module './componentTokens.types' {
  interface ComponentTokenRegistry {
    'test.example': { root: { color?: string; 'when.visualState.hovered'?: { color: string } } };
  }
}

const definition = defineComponentTokens({ id: 'test.example', axes, slots, schema });
const { resolved: light } = resolveThemeAppearance({ colorScheme: 'light' }, {});

it('resolves all matching fields independently and only caches relevant state values', () => {
  const root = getComponentTokens(getThemeState(new FlexThemeReference(), light), definition).root;
  const select = { selected: true, visualState: 'hovered' as const };
  const state = Object.defineProperty({ ...select }, 'unused', {
    enumerable: true,
    get() {
      throw new Error('unrelated state was read');
    },
  });
  expect(resolveTokenStates(root, state)).toEqual({ style: { color: 'selected hover', borderColor: 'hover border' }, props: {} });
  expect(resolveTokenStates(root, state)).toBe(resolveTokenStates(root, select));
  expect(resolveTokenStates(root, state, { visualState: 'disabled' }).style).toEqual({ color: 'disabled' });
});

it('applies parent and child layers after defaults, each with its own specificity, and invalidates revision caches', () => {
  const parent = new FlexThemeReference({
    componentTokens: { 'test.example': { root: { 'when.visualState.hovered': { color: 'parent hover' } } } },
  });
  const child = new FlexThemeReference({ base: parent, componentTokens: { 'test.example': { root: { color: 'child base' } } } });
  const state = { selected: true, visualState: 'hovered' as const };
  const first = getThemeState(child, light);
  const tokens = getComponentTokens(first, definition);
  expect(getComponentTokens(first, definition)).toBe(tokens);
  expect(resolveTokenStates(tokens.root, state).style).toEqual({ color: 'child base', borderColor: 'hover border' });
  child.updateComponentTokens();
  expect(resolveTokenStates(getComponentTokens(getThemeState(child, light), definition).root, state).style.color).toBe('parent hover');
  parent.updateComponentTokens({
    'test.example': ({ appearance }) => ({
      root: { color: 'parent base', 'when.visualState.hovered': { color: `${appearance.colorScheme} hover` } },
    }),
  });
  for (const colorScheme of ['light', 'dark'] as const) {
    const appearance = resolveThemeAppearance({ colorScheme }, {}).resolved;
    expect(resolveTokenStates(getComponentTokens(getThemeState(child, appearance), definition).root, state).style.color).toBe(
      `${colorScheme} hover`,
    );
  }
});

it('does not read losing or unused interaction color members', () => {
  const base = getThemeState(new FlexThemeReference(), light);
  const hover = jest.fn(() => 'hover token');
  const pressed = jest.fn(() => 'pressed token');
  const theme = {
    ...base,
    tokens: {
      ...base.tokens,
      color: {
        ...base.tokens.color,
        foregroundNeutralPrimary: {
          rest: 'rest token',
          get hover() {
            return hover();
          },
          get pressed() {
            return pressed();
          },
        },
      },
    },
  };
  const { root } = getComponentTokens(theme, definition);
  expect(resolveTokenStates(root, { selected: false, visualState: 'rest' }).style.color).toBe('rest token');
  expect(resolveTokenStates(root, { selected: false, visualState: 'hovered' }).style.color).toBe('hover');
  expect(hover).not.toHaveBeenCalled();
  expect(pressed).not.toHaveBeenCalled();
  expect(resolveTokenStates(root, { selected: false, visualState: 'pressed' }).style.color).toBe('pressed token');
  expect(pressed).toHaveBeenCalledTimes(1);
});

it('reports malformed selectors and unknown token paths instead of accepting an incomplete layer', () => {
  expect(() =>
    defineComponentTokens({
      id: 'test.example',
      axes,
      slots,
      schema: { ...schema, bindings: { root: { 'when.visualState.hovered': { 'when.selected.true': { color: 'invalid' } } } } },
    }),
  ).toThrow('test.example.root.when.visualState.hovered.when.selected.true');
  const source = new FlexThemeReference({ componentTokens: { 'test.example': { root: { color: 'tokens:color.missing.rest' } } } });
  expect(() => getComponentTokens(getThemeState(source, light), definition)).toThrow('unknown Flex token color.missing');
});
