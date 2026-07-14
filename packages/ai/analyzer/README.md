# `@fluentui-react-native/analyzer`

Analysis utilities for Fluent UI React Native components, designed for agent-driven workflows.

This package helps you:

- map rendered styles back to design tokens
- extract and validate accessibility trees
- run component state matrices (props + interactions) and collect per-state snapshots

## What it exports

Top-level exports are grouped into four areas:

1. **Tree**
   - `normalizeRenderTree`
   - `walkTree`
   - `serializeRenderTree`
2. **Theme/token mapping**
   - `createTestTheme`
   - `createTokenRegistry`
   - `extractStyles`
   - `resolveStyleToTokens`
   - `mapComponentToTokens`
3. **Accessibility**
   - `extractA11yTree`
   - `serializeA11yTree`
   - `defaultA11yRules`
   - `findA11yIssues`
4. **Component-state analysis**
   - `validateMetadata`
   - `runComponentMatrix`
   - `analyzeComponent`

Shared contracts are exported from `src/types.ts` (for example `RenderNode`, `SlotPath`, `AnalyzerOutput`, `AnalyzerIssue`).

## Quick start

### 1. Reverse-map styles to token paths

```ts
import * as renderer from 'react-test-renderer';
import { ThemeProvider, ThemeReference } from '@fluentui-react-native/theme';
import { Button } from '@fluentui/react-native';
import { createTestTheme, mapComponentToTokens } from '@fluentui-react-native/analyzer';

const { theme, registry } = createTestTheme();
const tree = renderer.create(
  <ThemeProvider theme={new ThemeReference(theme)}>
    <Button>Hello</Button>
  </ThemeProvider>,
);

const tokenMap = mapComponentToTokens(tree, registry);
```

### 2. Extract an accessibility tree + issues

```ts
import { normalizeRenderTree, extractA11yTree, findA11yIssues } from '@fluentui-react-native/analyzer';

const normalized = normalizeRenderTree(rendererOutput);
if (normalized) {
  const a11yTree = extractA11yTree(normalized);
  const issues = findA11yIssues(a11yTree);
}
```

### 3. Run per-state component analysis

```ts
import { analyzeComponent, type ComponentMetadata } from '@fluentui-react-native/analyzer';
import { Button } from '@fluentui/react-native';

const metadata: ComponentMetadata = {
  name: 'Button',
  importPath: '@fluentui-react-native/button',
  exportName: 'Button',
  baseProps: { testID: 'button-root', children: 'Hi' },
  states: [
    { id: 'default' },
    { id: 'disabled', props: { disabled: true } },
    { id: 'pressed', interactions: [{ kind: 'press', targetTestID: 'button-root' }] },
  ],
};

const result = await analyzeComponent({ Component: Button, metadata });
```

## Metadata and instructions

- Component metadata schema: `src/component/ComponentMetadata.ts`
- Metadata validator: `src/component/validateMetadata.ts`
- Agent prompt for state discovery: `src/component/instructions/state-discovery.md`
- Agent prompt for accessibility review: `src/a11y/instructions/accessibility-review.md`

## Development

From repo root:

```bash
yarn workspace @fluentui-react-native/analyzer build
yarn workspace @fluentui-react-native/analyzer test
yarn workspace @fluentui-react-native/analyzer lint
```

## Notes

- This package is ESM with CJS output (`lib/` and `lib-commonjs/`).
- API barrels are explicit (no wildcard exports) to satisfy repo lint rules.
