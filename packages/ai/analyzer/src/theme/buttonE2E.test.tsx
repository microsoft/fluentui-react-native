/**
 * End-to-end test for the theme/token reverse-mapping pipeline.
 *
 * Renders a real V1 `Button` from `@fluentui/react-native`, wrapped in
 * a real `ThemeProvider` carrying the analyzer's test theme, and
 * asserts the reverse-mapper can attribute the root slot's
 * `backgroundColor` back to a registered token path.
 *
 * The assertion is intentionally loose ("path starts with `colors.` or
 * `components.Button.`"). The goal is to prove the reverse map works,
 * not to pin down Button's current styling — Button defaults can
 * evolve without breaking this test.
 */
import { act } from 'react';
import * as renderer from 'react-test-renderer';

import { Button } from '@fluentui/react-native';
import { ThemeProvider, ThemeReference } from '@fluentui-react-native/theme';

import { createTestTheme } from './createTestTheme.ts';
import { mapComponentToTokens } from './mapComponentToTokens.ts';

describe('end-to-end: Button rendered with test theme', () => {
  it('reverse-maps the root slot backgroundColor to a known token path', () => {
    const { theme, registry } = createTestTheme();
    const themeRef = new ThemeReference(theme);

    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <ThemeProvider theme={themeRef}>
          <Button>Hello</Button>
        </ThemeProvider>,
      );
    });

    const output = mapComponentToTokens(component!, registry);

    // The token map should describe at least one slot — Button always
    // renders at minimum a root `View` and a content `Text`.
    expect(output.data.slots.length).toBeGreaterThan(0);

    // Find the root slot's backgroundColor entry. The renderer's top
    // node is the Button root; its style carries backgroundColor.
    const root = output.data.slots[0];
    expect(root.path).toEqual([]);
    const bg = root.entries.find((e) => e.property === 'backgroundColor');
    expect(bg).toBeDefined();
    expect(bg!.tokenPath).toBeDefined();
    // The brief explicitly says: don't pin exact paths. We accept any
    // path that originates in the theme's color or component-override
    // namespaces, which is what Button's default-tokens reach for.
    expect(bg!.tokenPath!).toMatch(/^(colors\.|components\.Button\.)/);
  });

  it('captures at least one resolved tokenPath across the whole tree', () => {
    // Stronger smoke check: regardless of which slot or property
    // ends up registered, the token map should be non-trivial.
    const { theme, registry } = createTestTheme();
    const themeRef = new ThemeReference(theme);

    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <ThemeProvider theme={themeRef}>
          <Button>Hello</Button>
        </ThemeProvider>,
      );
    });

    const output = mapComponentToTokens(component!, registry);
    const allEntries = output.data.slots.flatMap((s) => s.entries);
    const annotated = allEntries.filter((e) => e.tokenPath !== undefined);
    expect(annotated.length).toBeGreaterThan(0);
  });
});
