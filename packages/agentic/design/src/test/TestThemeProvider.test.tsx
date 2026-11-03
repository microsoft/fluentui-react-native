import { act, create } from 'react-test-renderer';

import { defaultResolvedThemeAppearance } from '../theming/appearance';
import { defaultFlexTokens } from '../flex/defaults/defaultTokens';
import { FlexThemeReference } from '../flex/flexThemeReference';
import { useThemeAppearance, useThemeState } from '../flex/useThemeState';
import type { ThemeState } from '../flex/themeState.types';
import { createThemeWrapper, TestThemeProvider } from './TestThemeProvider';

function Probe({ states, appearances }: { states: ThemeState[]; appearances: ReturnType<typeof useThemeAppearance>[] }) {
  states.push(useThemeState());
  appearances.push(useThemeAppearance());
  return null;
}

describe('TestThemeProvider', () => {
  it('provides the default Flex tokens in the light appearance', () => {
    const states: ThemeState[] = [];
    const appearances: ReturnType<typeof useThemeAppearance>[] = [];

    act(
      () =>
        void create(
          <TestThemeProvider>
            <Probe states={states} appearances={appearances} />
          </TestThemeProvider>,
        ),
    );

    expect(states[0].tokens).toEqual(defaultFlexTokens);
    expect(states[0].appearance).toBe(defaultResolvedThemeAppearance);
    expect(appearances[0].resolved).toBe(defaultResolvedThemeAppearance);
  });

  it('accepts a theme and appearance request', () => {
    const states: ThemeState[] = [];
    const theme = new FlexThemeReference({ base: { color: { backgroundBrandHeavy: '#123456' } } });

    act(
      () =>
        void create(
          <TestThemeProvider theme={theme} appearance={{ colorScheme: 'dark' }}>
            <Probe states={states} appearances={[]} />
          </TestThemeProvider>,
        ),
    );

    expect(states[0].tokens.color.backgroundBrandHeavy.rest).toBe('#123456');
    expect(states[0].appearance.colorScheme).toBe('dark');
  });

  it('creates a wrapper that keeps one theme state across rerenders', () => {
    const Wrapper = createThemeWrapper();
    const states: ThemeState[] = [];
    let renderer: ReturnType<typeof create>;

    act(() => {
      renderer = create(
        <Wrapper>
          <Probe states={states} appearances={[]} />
        </Wrapper>,
      );
    });
    act(() =>
      renderer.update(
        <Wrapper>
          <Probe states={states} appearances={[]} />
        </Wrapper>,
      ),
    );

    expect(states).toHaveLength(2);
    expect(states[1]).toBe(states[0]);
    act(() => renderer.unmount());
  });
});
