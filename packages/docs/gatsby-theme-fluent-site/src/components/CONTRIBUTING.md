# A WIP guide to contributing components

  > Just gathering some thoughts and notes. These are not final, may change with additional clarity, and are open for discussion. - Scott

## Notes for components:
 1. The UI for the docs site should be built using Fluent UI. Seems like table stakes.
 2. Initially, we will need to scaffold out the site using components built with JSX tags.
 3. Some level of run-time theming will need to be supported.
 4. Theming should leverage the same Fluent UI base styles.
     - Possible themes include high contrast, dark mode, etc.

## Component questions / thoughts:

1. Can we use the Fluent UI components directly in code or do we need a proxy component to make global changes easier?

    > I am leaning on using the Fluent UI components directly since we will be custom-building a version of it for the docs site. - Scott

2. Does overall site theming affect the theme that is shown on any given component?
3. Is global / local theming a setting somewhere?
4. How are design-time customizations exposed for use in the site?

---

## Notes for CSS variables:
- There seems to be a logical divide between theme styles that are static and dynamic.
- Some properties need to be changed at runtime. This includes color themes, density, and others.
- Some properties only need to be changed at design time. This includes most other aspects of the design system: ramps (type, spacing, color), elevation, etc.
- Fallback values will need to provided in a way that allows legacy browser to style things correctly.
    - Fallbacks can use the `var(--bg-color, white)` syntax.
    - Or they can be made more robust w/ graceful degredation by declaring legacy properties alongside variable properties.
- When leveraging CSS variables, media queries are used to change the value of custom properties.
    - This separates out the styling blocks from the layout logic.
- It might make sense to use special casing for global CSS variables, e.g. `--PAGE-BG-COLOR` to more easily differentiate them from local variables.

## CSS variables questions / thoughts:

1. How do we reconcile runtime styling and design time styling?
    - The site will need some flexibility that the compiled library won’t need. For example, the theme editor with need to change design-time properties on the fly, but implementations of Fluent UI will not introduce these aspects as runtime properties.
