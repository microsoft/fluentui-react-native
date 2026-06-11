# Overview

We are working on a plan to modernize furn and enable authoring fluent themed react-native components with agents.

This work will result in the creation of new packages underneath this path.

Do the following:

1. Investigate the following topics with one dedicated sub-agent for each.
2. When they complete, look at the plans and see how they intersect.
3. Create a PLAN.md or README.md for each package in the new folder for that package then a STAGING.md file with an execution plan for this.

## Gather v1 concepts

- Create a concepts package that is used for common concepts, types, and instructions for understanding current components and building new components.
- Analyze the v1 components in the repo (those that use the packages in packages/framework), gather information about states, appearance, interactions, accessibility, and common token references.
- Create a plan to create pinning tests for the existing components to ensure that we don't break things as we refactor

## Agentic authoring

- Create a distributable agent and potentially MCP server to enable authoring new components using fluent themes
- Investigate the code in https://github.com/microsoft/fluentui referenced by AGENTS.md and the skills to mimic the new structure they are using to create a similar pattern for react-native.
- Read https://microsoft-my.sharepoint-df.com/:w:/p/popatudor/cQqZQwg00VNJRby4i2YVjIxJEgUCkrXkbKQophGWqlFA9ANc2Q for modern authoring concepts to apply those

## New common styles and tokens

- Instead of authoring the new controls directly against the theme, create a common tokens object with semantic slots.
- Look at https://github.com/x3-design/fluent-design/blob/main/plugins/tokens/skills/core/SKILL.md for latest thinking on how they are defined for web
- Pull together what components actually reference to map the old ideas to the new ones

## Analysis package

Create an analyzer package that can:

- Create a custom theme with unique values per entry so that resolved styles or tokens can be mapped back to their semantic names.
- Create tests that use the newer @testing-library/react-native and can do things like extract accessibility trees, styles, snapshots, etc.
- Pin token values and style values in v1 components such that we can safely refactor.
- Have a strategy for multiplexing jest tests for each platform when needed.

## New components

Create a single component package that creates equivalent components to the v1 components, but authored in the new style

- Don't use compose or customize
- Create a structure that more closely mirrors modern fluent ideas
- Have a flat structure where components don't depend on other components but instead reference common hooks, tokens, styles, helpers etc. (similar to fluent)
