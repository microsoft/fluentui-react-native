# Platform Divergence and Layering

This document should cover platform divergences and how these divergences are layered on top of one another

- It should be generally high level
- It should target humans as an audience
- Detailed topic breakouts should be researched and put under a references subfolder
- Links to source files or knowledge base files should be provided where possible

Start with an overview, an explanation of layering and potentially a layering diagram.

## Divergence From Core

This should be the places where react-native-macos, react-native-windows, and react-native-win32 diverge or add capabilities on top of core.

- it should have a comparison table
- reference ../divergence/macos-divergence.md and ../divergence/windows-divergence.md for research, those files will go away so information there should be included in this plan or in topic breakouts

## Office Divergence

This should analyze the additional ways in which we layer additional capabilities for Office on top of react-native-macos/windows/win32

## Conponent Layering

Analyze the code in this repo, with particular attention to things like callout, focus zone, and the recent dropdown changes. Look at a11y handling and focus handling. Look at ways the platform differences are handled with an eye towards API generalization or core extensions.

## Potential extensions to core

- high level summary with breakout articles
- potential APIs to upstream to core react-native
- these APIs should be general enough that other out of tree platforms could implement them

In each sub-article/proposal:

- what the proposal might look like, with some options
- it should include how the contract could be validated in core
