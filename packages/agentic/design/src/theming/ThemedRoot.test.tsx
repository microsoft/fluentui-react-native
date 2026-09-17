import * as React from 'react';
import { Platform, View } from 'react-native';

import { act, create } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';

import { mockTheme } from '../testing/mockTheme';
import { defaultFlexTokens } from '../tokens/defaultTokens';
import { useThemeState } from '../useThemeState';
import type { ThemeState } from '../useThemeState';
import type { ResolvedThemeAppearance, ThemeAppearanceSource, ThemeAppearanceSourceSnapshot } from './appearance.types';
import { ThemeContext } from './context';
import { FlexThemeReference } from './flexThemeReference';
import { useRootSettings } from './rootContext';
import type { RootSettings } from './rootContext';
import { ThemedRoot } from './ThemedRoot';
import { ThemeProvider } from './ThemeProvider';

function Probe({ roots, themes }: { roots?: RootSettings[]; themes?: ThemeState[] }) {
  const root = useRootSettings();
  const theme = useThemeState();
  roots?.push(root);
  themes?.push(theme);
  return null;
}

function createAppearanceSource(initial: ThemeAppearanceSourceSnapshot = {}) {
  let snapshot = initial;
  const listeners = new Set<() => void>();
  return {
    source: {
      getSnapshot: () => snapshot,
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    } satisfies ThemeAppearanceSource,
    update(next: ThemeAppearanceSourceSnapshot) {
      snapshot = next;
      listeners.forEach((listener) => listener());
    },
    listeners,
  };
}

const keyEvent = {
  nativeEvent: { key: 'Tab', altKey: false, ctrlKey: false, metaKey: false, shiftKey: false },
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
};
const pointerEvent = { nativeEvent: { pointerType: 'mouse' } };
const touchEvent = { nativeEvent: { touches: [{}] } };

describe('ThemedRoot', () => {
  let component: ReactTestRenderer | undefined;

  function render(element: React.ReactElement) {
    act(() => {
      component = create(element);
    });
  }

  function view(testID = 'root') {
    return component!.root.findAllByType(View).find((node) => node.props.testID === testID)!;
  }

  afterEach(() => {
    act(() => component?.unmount());
    component = undefined;
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('provides default Flex tokens and forwards View props, children, and the ref', () => {
    const roots: RootSettings[] = [];
    const themes: ThemeState[] = [];
    const ref = React.createRef<View>();
    const style = { flex: 1 };
    const onLayout = jest.fn();
    render(
      <ThemedRoot ref={ref} testID="root" style={style} accessibilityLabel="Scene" onLayout={onLayout}>
        <Probe roots={roots} themes={themes} />
      </ThemedRoot>,
    );

    expect(themes[0].tokens).toEqual(defaultFlexTokens);
    expect(roots[0].inputModality).toBe('pointer');
    expect(view().props.style).toBe(style);
    expect(view().props.accessibilityLabel).toBe('Scene');
    expect(view().props.onLayout).toBe(onLayout);
    expect(view().props.theme).toBeUndefined();
    expect(view().props.appearance).toBeUndefined();
    expect(ref.current).toBe(view().instance);
    expect(ref.current).not.toBeNull();
  });

  it('tracks keyboard, pointer, and touch input without rerendering consumers', () => {
    const roots: RootSettings[] = [];
    const themes: ThemeState[] = [];
    render(
      <ThemedRoot testID="root">
        <Probe roots={roots} themes={themes} />
      </ThemedRoot>,
    );
    const root = roots[0];
    act(() => view().props.onKeyDownCapture(keyEvent));
    expect(root.inputModality).toBe('keyboard');
    act(() => view().props.onPointerDownCapture(pointerEvent));
    expect(root.inputModality).toBe('pointer');
    act(() => view().props.onKeyDown(keyEvent));
    expect(root.inputModality).toBe('keyboard');
    act(() => expect(view().props.onStartShouldSetResponderCapture(touchEvent)).toBe(false));
    expect(root.inputModality).toBe('pointer');
    expect(roots).toEqual([root]);
    expect(themes).toHaveLength(1);
    expect(keyEvent.preventDefault).not.toHaveBeenCalled();
    expect(keyEvent.stopPropagation).not.toHaveBeenCalled();
  });

  it('updates modality before invoking caller handlers and preserves responder ownership', () => {
    const roots: RootSettings[] = [];
    const onKeyDown = jest.fn(() => expect(roots[0].inputModality).toBe('keyboard'));
    const onKeyDownCapture = jest.fn(() => expect(roots[0].inputModality).toBe('keyboard'));
    const onPointerDownCapture = jest.fn(() => expect(roots[0].inputModality).toBe('pointer'));
    const onStartShouldSetResponderCapture = jest.fn(() => {
      expect(roots[0].inputModality).toBe('pointer');
      return true;
    });
    render(
      <ThemedRoot
        testID="root"
        onKeyDown={onKeyDown}
        onKeyDownCapture={onKeyDownCapture}
        onPointerDownCapture={onPointerDownCapture}
        onStartShouldSetResponderCapture={onStartShouldSetResponderCapture}
      >
        <Probe roots={roots} />
      </ThemedRoot>,
    );
    act(() => {
      view().props.onKeyDownCapture(keyEvent);
      view().props.onKeyDown(keyEvent);
      view().props.onPointerDownCapture(pointerEvent);
      view().props.onKeyDownCapture(keyEvent);
      expect(view().props.onStartShouldSetResponderCapture(touchEvent)).toBe(true);
    });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledWith(keyEvent);
    expect(onKeyDownCapture).toHaveBeenCalledTimes(2);
    expect(onKeyDownCapture).toHaveBeenCalledWith(keyEvent);
    expect(onPointerDownCapture).toHaveBeenCalledTimes(1);
    expect(onPointerDownCapture).toHaveBeenCalledWith(pointerEvent);
    expect(onStartShouldSetResponderCapture).toHaveBeenCalledTimes(1);
    expect(onStartShouldSetResponderCapture).toHaveBeenCalledWith(touchEvent);
  });

  it('preserves the live context and handler identities across appearance changes', () => {
    const roots: RootSettings[] = [];
    render(
      <ThemedRoot testID="root">
        <Probe roots={roots} />
      </ThemedRoot>,
    );
    const handlers = view().props;
    act(() => handlers.onKeyDownCapture(keyEvent));
    act(() => {
      component!.update(
        <ThemedRoot testID="root" appearance={{ colorScheme: 'dark' }}>
          <Probe roots={roots} />
        </ThemedRoot>,
      );
    });
    expect(roots.length).toBeGreaterThan(1);
    expect(roots.every((root) => root === roots[0])).toBe(true);
    expect(roots[0].inputModality).toBe('keyboard');
    expect(view().props.onKeyDownCapture).toBe(handlers.onKeyDownCapture);
    expect(view().props.onPointerDownCapture).toBe(handlers.onPointerDownCapture);
  });

  it('shares modality through nested roots even when a nested root replaces the theme', () => {
    const roots: RootSettings[] = [];
    const nestedRoots: RootSettings[] = [];
    const onKeyDown = jest.fn();
    const onKeyDownCapture = jest.fn();
    const onPointerDownCapture = jest.fn();
    const onStartShouldSetResponderCapture = jest.fn(() => false);
    render(
      <ThemedRoot testID="root">
        <Probe roots={roots} />
        <ThemedRoot testID="plain">
          <ThemedRoot
            testID="nested"
            theme={new FlexThemeReference()}
            onKeyDown={onKeyDown}
            onKeyDownCapture={onKeyDownCapture}
            onPointerDownCapture={onPointerDownCapture}
            onStartShouldSetResponderCapture={onStartShouldSetResponderCapture}
          >
            <Probe roots={nestedRoots} />
          </ThemedRoot>
        </ThemedRoot>
      </ThemedRoot>,
    );
    expect(nestedRoots[0]).toBe(roots[0]);
    for (const event of ['onKeyDown', 'onKeyDownCapture', 'onPointerDownCapture', 'onStartShouldSetResponderCapture']) {
      expect(view('plain').props[event]).toBeUndefined();
    }
    expect(view('nested').props.onKeyDown).toBe(onKeyDown);
    expect(view('nested').props.onKeyDownCapture).toBe(onKeyDownCapture);
    expect(view('nested').props.onPointerDownCapture).toBe(onPointerDownCapture);
    expect(view('nested').props.onStartShouldSetResponderCapture).toBe(onStartShouldSetResponderCapture);
    act(() => view().props.onKeyDownCapture(keyEvent));
    expect(nestedRoots[0].inputModality).toBe('keyboard');
    expect(nestedRoots).toHaveLength(1);
  });

  it('isolates independent scene roots', () => {
    const first: RootSettings[] = [];
    const second: RootSettings[] = [];
    render(
      <>
        <ThemedRoot testID="root">
          <Probe roots={first} />
        </ThemedRoot>
        <ThemedRoot testID="second">
          <Probe roots={second} />
        </ThemedRoot>
      </>,
    );
    act(() => view().props.onKeyDownCapture(keyEvent));
    expect(first[0]).not.toBe(second[0]);
    expect(first[0].inputModality).toBe('keyboard');
    expect(second[0].inputModality).toBe('pointer');
  });

  it.each(['macos', 'windows', 'win32', 'web', 'ios', 'android'])('uses supported event surfaces on %s', (platform) => {
    // win32 is a runtime platform supported by adapters, but is absent from core RN's OS union.
    jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    render(<ThemedRoot testID="root" />);
    expect(view().props.onPointerDownCapture).toEqual(expect.any(Function));
    expect(view().props.onStartShouldSetResponderCapture).toEqual(expect.any(Function));
    if (platform === 'ios' || platform === 'android') {
      expect(view().props.onKeyDown).toBeUndefined();
      expect(view().props.onKeyDownCapture).toBeUndefined();
    } else {
      expect(view().props.onKeyDown).toEqual(expect.any(Function));
      expect(view().props.onKeyDownCapture).toEqual(expect.any(Function));
    }
  });

  it('inherits a ThemeProvider source and overrides only requested appearance fields', () => {
    const parentThemes: ThemeState[] = [];
    const nestedThemes: ThemeState[] = [];
    const theme = new FlexThemeReference({
      base: ({ colorScheme }) => ({ color: { backgroundBrandHeavy: colorScheme === 'dark' ? '#111111' : '#eeeeee' } }),
    });
    render(
      <ThemeProvider theme={theme} appearance={{ colorScheme: 'dark', contrast: 'highContrast' }}>
        <ThemedRoot testID="root">
          <Probe themes={parentThemes} />
          <ThemedRoot appearance={{ interfaceLevel: 'elevated' }}>
            <Probe themes={nestedThemes} />
          </ThemedRoot>
        </ThemedRoot>
      </ThemeProvider>,
    );
    expect(nestedThemes[0].tokens.color.backgroundBrandHeavy).toBe('#111111');
    expect(nestedThemes[0].appearance).toEqual({ colorScheme: 'dark', contrast: 'highContrast', interfaceLevel: 'elevated' });
    expect(parentThemes[0].appearance.interfaceLevel).toBe('base');
    act(() => theme.update({ spacing: { componentBase100: 21 } }));
    expect(nestedThemes[nestedThemes.length - 1].tokens.spacing.componentBase100).toBe(21);
  });

  it('inherits live appearance sources and merges fallback fields from provider boundaries', () => {
    const appearance = createAppearanceSource();
    const themes: ThemeState[] = [];
    render(
      <ThemeProvider
        theme={new FlexThemeReference()}
        appearanceSource={appearance.source}
        fallbackAppearance={{ colorScheme: 'dark', contrast: 'highContrast' }}
      >
        <ThemedRoot fallbackAppearance={{ interfaceLevel: 'elevated' }}>
          <ThemedRoot>
            <Probe themes={themes} />
          </ThemedRoot>
        </ThemedRoot>
      </ThemeProvider>,
    );
    expect(themes[0].appearance).toEqual({ colorScheme: 'dark', contrast: 'highContrast', interfaceLevel: 'elevated' });
    act(() => appearance.update({ colorScheme: 'light', contrast: 'standard' }));
    expect(themes[themes.length - 1].appearance).toEqual({ colorScheme: 'light', contrast: 'standard', interfaceLevel: 'elevated' });
    act(() => component!.unmount());
    expect(appearance.listeners.size).toBe(0);
  });

  it('can opt an inherited fixed appearance back into the inherited system source', () => {
    const appearance = createAppearanceSource({ colorScheme: 'light' });
    const themes: ThemeState[] = [];
    render(
      <ThemedRoot appearance={{ colorScheme: 'dark' }} appearanceSource={appearance.source}>
        <ThemedRoot appearance={{ colorScheme: 'system' }}>
          <Probe themes={themes} />
        </ThemedRoot>
      </ThemedRoot>,
    );
    expect(themes[0].appearance.colorScheme).toBe('light');
    act(() => appearance.update({ colorScheme: 'dark' }));
    expect(themes[themes.length - 1].appearance.colorScheme).toBe('dark');
  });

  it('propagates source fallback changes when the source is invalidated', () => {
    const fallback: Partial<ResolvedThemeAppearance> = { colorScheme: 'dark' };
    const theme = new FlexThemeReference({
      appearanceSource: createAppearanceSource().source,
      fallbackAppearance: fallback,
    });
    const themes: ThemeState[] = [];
    render(
      <ThemedRoot theme={theme}>
        <ThemedRoot>
          <Probe themes={themes} />
        </ThemedRoot>
      </ThemedRoot>,
    );
    expect(themes[0].appearance.colorScheme).toBe('dark');
    act(() => {
      fallback.colorScheme = 'light';
      theme.invalidate();
    });
    expect(themes[themes.length - 1].appearance.colorScheme).toBe('light');
  });

  it('lets a nested root replace the appearance source without replacing the theme', () => {
    const outer = createAppearanceSource({ colorScheme: 'dark' });
    const inner = createAppearanceSource({ colorScheme: 'light' });
    const themes: ThemeState[] = [];
    render(
      <ThemedRoot theme={new FlexThemeReference({ base: { spacing: { componentBase100: 23 } } })} appearanceSource={outer.source}>
        <ThemedRoot appearanceSource={inner.source}>
          <Probe themes={themes} />
        </ThemedRoot>
      </ThemedRoot>,
    );
    expect(themes[0].appearance.colorScheme).toBe('light');
    expect(themes[0].tokens.spacing.componentBase100).toBe(23);
    act(() => inner.update({ colorScheme: 'dark' }));
    expect(themes[themes.length - 1].appearance.colorScheme).toBe('dark');
  });

  it('uses an explicit theme configuration rather than inheriting appearance overrides', () => {
    const themes: ThemeState[] = [];
    render(
      <ThemedRoot appearance={{ colorScheme: 'dark', contrast: 'highContrast' }}>
        <ThemedRoot
          theme={
            new FlexThemeReference({
              base: { spacing: { componentBase100: 25 } },
              appearance: { colorScheme: 'light', contrast: 'standard' },
            })
          }
        >
          <Probe themes={themes} />
        </ThemedRoot>
      </ThemedRoot>,
    );
    expect(themes[0].appearance.colorScheme).toBe('light');
    expect(themes[0].appearance.contrast).toBe('standard');
    expect(themes[0].tokens.spacing.componentBase100).toBe(25);
  });

  it('inherits the nearest raw legacy theme rather than a more distant source', () => {
    const themes: ThemeState[] = [];
    const legacyTheme = {
      ...mockTheme,
      colors: { ...mockTheme.colors, neutralBackground2: '#123456' },
      host: { ...mockTheme.host, appearance: 'dark' as const },
    };
    render(
      <ThemedRoot>
        <ThemeContext.Provider value={legacyTheme}>
          <ThemedRoot>
            <Probe themes={themes} />
          </ThemedRoot>
        </ThemeContext.Provider>
      </ThemedRoot>,
    );
    expect(themes[0].tokens.color.backgroundNeutralSubtle).toBe('#123456');
    expect(themes[0].appearance.colorScheme).toBe('dark');
  });

  it('reports a missing scene root instead of returning an untracked modality', () => {
    expect(() => {
      act(() => {
        create(<Probe />);
      });
    }).toThrow('useRootSettings must be used within a ThemedRoot.');
  });
});
