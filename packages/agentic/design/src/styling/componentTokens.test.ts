import { getThemeState } from '../flex/themeState';
import { FlexThemeReference } from '../flex/flexThemeReference';
import { resolveThemeAppearance } from '../theming/appearance';
import { defineComponentTokens, getComponentTokens, resolveTokenStates } from './componentTokens';
import { assetField } from './assetField';
import type { TokenState } from './componentTokens.types';

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

const definition = defineComponentTokens<TokenState<typeof axes>, typeof slots>({ id: 'test.example', slots, schema });
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
      slots,
      schema: { ...schema, bindings: { root: { 'when.visualState.hovered': { 'when.selected.true': { color: 'invalid' } } } } },
    }),
  ).toThrow('test.example.root.when.visualState.hovered.when.selected.true');
  const source = new FlexThemeReference({ componentTokens: { 'test.example': { root: { color: 'tokens:color.missing.rest' } } } });
  expect(() => getComponentTokens(getThemeState(source, light), definition)).toThrow('unknown Flex token color.missing');
});

it.each([null, [['selected', [null]]], [['selected']], [[42, [true]]]])('rejects invalid schema axes: %j', (axes) => {
  expect(() => defineComponentTokens({ id: 'test.example', slots, schema: { ...schema, axes } })).toThrow(/test\.example.*expected/);
});

it('validates every asset reference but reads and memoizes only the winning asset', () => {
  const normal = jest.fn(() => 'normal');
  const selected = jest.fn(() => 'selected');
  const fields = { root: { style: {}, props: { image: assetField('artwork', { normal, selected }, stringValue) } } };
  const bindings = { root: { image: 'artwork: normal', 'when.selected.true': { image: 'artwork:selected' } } };
  const definition = defineComponentTokens<{ selected: boolean }, typeof fields>({
    id: 'test.example',
    slots: fields,
    schema: { ...schema, bindings },
  });
  const theme = getThemeState(new FlexThemeReference(), light);
  const { root } = getComponentTokens(theme, definition);
  expect(normal).not.toHaveBeenCalled();
  expect(selected).not.toHaveBeenCalled();
  expect(resolveTokenStates(root, { selected: true }).props.image).toBe('selected');
  expect(resolveTokenStates(root, { selected: true }).props.image).toBe('selected');
  expect(normal).not.toHaveBeenCalled();
  expect(selected).toHaveBeenCalledTimes(1);
  expect(() =>
    defineComponentTokens({
      id: 'test.example',
      slots: fields,
      schema: { ...schema, bindings: { root: { ...bindings.root, 'when.selected.false': { image: 'artwork: missing' } } } },
    }),
  ).toThrow('test.example.root.when.selected.false.image: Unknown artwork asset "missing"');
});
