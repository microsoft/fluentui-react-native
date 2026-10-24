import { act, create } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';

import * as interaction from '../../color-lib/interaction';
import { ThemedRoot } from '../../theming/ThemedRoot';
import type { NormalizedThemeAppearance } from '../../types/appearance.types';
import { defaultFlexTokenDescription } from '../defaults/defaultTokens';
import { FlexThemeReference } from '../flexThemeReference';
import { mergeFlexTokenDescription } from '../flexTokenDescription';
import type { FlexTokens } from '../tokens.types';
import { useThemeState } from '../useThemeState';
import { flexColor, normalizeFlexColor } from './flexColor';
import { resolveFlexColor, resolveFlexTokenDescription } from './interactionPolicy';

const lightCool: NormalizedThemeAppearance = { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base', colorTone: 'cool' };

describe('interaction derivation laziness', () => {
  let engine: jest.SpyInstance;

  beforeEach(() => {
    engine = jest.spyOn(interaction, 'getInteractionColor');
  });

  afterEach(() => {
    engine.mockRestore();
  });

  it('computes nothing when tokens resolve and only rest values are read', () => {
    const description = mergeFlexTokenDescription(defaultFlexTokenDescription, {
      color: { backgroundBrandHeavy: flexColor('#123456', 'inverted'), backgroundNeutralSubtle: '#fafafa' },
    });

    const tokens = resolveFlexTokenDescription(description, lightCool);
    for (const color of Object.values(tokens.color)) {
      void color.rest;
    }

    expect(Object.keys(tokens.color)).toContain('backgroundBrandHeavy');
    expect(engine).not.toHaveBeenCalled();
  });

  it('computes only the read state, once', () => {
    const color = resolveFlexColor('backgroundBrandHeavy', normalizeFlexColor('#123456', 'inverted'), lightCool);

    const first = color.hover;
    const second = color.hover;

    expect(second).toBe(first);
    expect(engine).toHaveBeenCalledTimes(1);
    expect(engine).toHaveBeenCalledWith('#123456', 'light', 'hover', expect.objectContaining({ direction: 'inverted' }));

    void color.pressed;
    void color.pressed;

    expect(engine).toHaveBeenCalledTimes(2);
    expect(engine).toHaveBeenLastCalledWith('#123456', 'light', 'pressed', expect.objectContaining({ direction: 'inverted' }));
  });

  it('never computes explicit states', () => {
    const color = resolveFlexColor(
      'backgroundBrandHeavy',
      normalizeFlexColor({ rest: '#123456', hover: '#234567', pressed: '#345678' }),
      lightCool,
    );

    expect(color).toEqual({ rest: '#123456', hover: '#234567', pressed: '#345678' });
    expect(engine).not.toHaveBeenCalled();
  });

  it('does not compute states while merging descriptions or resolving a theme reference', () => {
    const reference = new FlexThemeReference({ base: { color: { backgroundBrandHeavy: flexColor('#123456', 'inverted') } } });
    const child = new FlexThemeReference({ base: reference }, { color: { backgroundBrandSoft: '#eeeeff' } });

    const tokens = child.resolveFlexTokens(lightCool);

    expect(tokens.color.backgroundBrandHeavy.rest).toBe('#123456');
    expect(engine).not.toHaveBeenCalled();

    void tokens.color.backgroundBrandSoft.hover;
    expect(engine).toHaveBeenCalledTimes(1);
  });

  it('computes nothing when a provider mounts and a consumer reads rest', () => {
    const reference = new FlexThemeReference({ base: { color: { backgroundBrandHeavy: flexColor('#123456', 'inverted') } } });
    const seen: FlexTokens[] = [];
    function Probe() {
      const { tokens } = useThemeState();
      seen.push(tokens);
      void tokens.color.backgroundBrandHeavy.rest;
      return null;
    }

    let component: ReactTestRenderer;
    act(() => {
      component = create(
        <ThemedRoot theme={reference} appearance={{ colorScheme: 'light', contrast: 'standard' }}>
          <Probe />
        </ThemedRoot>,
      );
    });

    expect(seen[0].color.backgroundBrandHeavy.rest).toBe('#123456');
    expect(engine).not.toHaveBeenCalled();
    act(() => component!.unmount());
  });

  it('does not read states when resolved colors are copied by reference', () => {
    const reference = new FlexThemeReference({ base: { color: { backgroundBrandHeavy: flexColor('#123456', 'inverted') } } });
    const tokens = reference.resolveFlexTokens(lightCool);

    const copy = { ...tokens, color: { ...tokens.color } };

    expect(copy.color.backgroundBrandHeavy).toBe(tokens.color.backgroundBrandHeavy);
    expect(engine).not.toHaveBeenCalled();
  });
});
