# Agentic Components authoring

These instructions apply to `packages/agentic-components` and its descendants.

Read the scoped instructions in `src/components/AGENTS.md` for higher-order components,
`src/primitives/AGENTS.md` for primitives, and `storybook/AGENTS.md` before changing the Storybook application.

## Storybook story authoring

Use the Fluent UI React v9 Button stories and the Fluent headless Button stories as the structural references:

- `microsoft/fluentui/packages/react-components/react-button/stories/src/Button`
- `microsoft/fluentui/packages/react-components/react-headless-components-preview/stories/src/Button`

Use the styled v9 suite as the model for focused API-axis stories and the headless suite as the model for a compact,
grouped contract overview. Adapt their intent to React Native rather than copying web-only markup, CSS, props, or
Storybook configuration.

- Colocate `<component>.stories.tsx` with the component. The agentic Storybook source glob discovers it automatically;
  do not add a manual registration.
- Export typed CSF metadata with the component, a `Components/<Component>` or `Primitives/<Component>` title, useful
  default args, controls for finite prop unions, and a short component description derived from the component spec.
- Keep `Default` args-driven so Storybook controls exercise the public API. For components with several visual axes,
  also provide one grouped `Overview` story that gives a quick scan of the supported contract.
- Add focused named stories for meaningful axes and states such as appearance, size, shape, slots, selection, disabled
  behavior, and constrained content. Compare all values for one axis in the same canvas instead of creating one story
  per value.
- Add `parameters.docs.description.story` to focused stories so their purpose and default behavior remain available to
  Storybook documentation and agent tooling.
- Use React Native `View`, `Text`, and a module-scoped `StyleSheet` only for story layout, grouping, captions, or a
  constraint needed by the scenario. Do not restyle a higher-order component to manufacture a variant. An unstyled
  primitive may include clearly demonstration-only styling when its contract requires a visible example.
- Exercise the public slot API directly. Include representative optional-slot placement and state replacement, not
  private render helpers or implementation details.
- Keep examples accessible: icon-only controls need an action-oriented `accessibilityLabel`, state examples must expose
  the component's real accessibility semantics, and visible labels should describe the scenario.
- Cover only behavior supported by the React Native component and its spec. Do not invent web-only props such as
  `disabledFocusable`, DOM children, or CSS class hooks.

Use `src/components/button/button.stories.tsx` as the canonical higher-order example. Validate story changes with the
package format and lint scripts and a declared Storybook bundle command.
