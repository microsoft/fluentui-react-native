# Component Traits Plan

I want to build a plan to change the component generation workflow to include a traits object.

## Component Traits

- There should be a component traits object type, likely defined in the agentic/design package, maybe in a traits submodule
- This submodule should also contain helpers that can render things like style fragments based on traits
- Trait helpers should help reduce boilerplate code and code duplication, encode common flex patterns or rules
- Helper signatures should be optimized for bundle-size, particularly for initialize once type values such as cached styles
- Each component would define its own traits object as part of the spec generation process
- Each trait would have a set of instructions and/or helpers for it
- Some traits could be optional if they only apply to some components

## Potential Traits

For each potential trait investigated:

- list the name of the trait, values, potential helper functions, potential instruction or rule encodings, and so on.
- list tradeoffs or pros and cons
- provide a suggestion of whether it makes sense as a trait, or whether it should be a standalone helper, or whether it should be ignored

Things to research:

- **Prior Research** - Be sure to look at some of the research done in ../flex-research.yaml and ../flex-rules.yaml and see what fits in this pattern
- **Borders** - does a component use borders via stroke color, transparent borders, or no borders
- **Rounding** - which rounding pattern does this follow? It seems likely that there will need to be a theme setting that allows components like button to be less rounded on a fluent theme than on a flex theme.
- **Interactive Parts** - which set of background, foreground, border react to hover or press
- **Interactivity Level** - whether a component responds to hover always, never, or is platform dependent. Some components should not have hover on macos to follow system behavior.
- **Font Combinations** - Are there helpers for how to pick out fonts, with or without line height added
- **Presentation Type** - It seems like components are generally transparent, neutral, or deep/loud in their structure. This may require allowing some sort of variant pattern for things like button that have multiple appearances
- **Base Layers** - via flex rules, it feels like given a background color token name, an object with the primary, secondary, tertiary or primary, secondary, emphasis foregrounds, standard stroke color, disabled background, foreground, and stroke. These helpers could correspond to the presentation type.

## Flex Theme Optimizations

As part of the research if there are optimizations that would make using the flex tokens easier, require less code, or make the helpers implementations simpler list them here.

Seeded topics:

- **Font Restructuring** - should functional and content font measurements be in separate trees, with shortened names so instead of tokens.lineHeight.functionalTitleMedium use tokens.functional.titleMedium.lineHeight, merging the trunks then having a functional font helper and a content font helper to set the type.
