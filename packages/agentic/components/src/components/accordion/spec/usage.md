# Accordion usage

Use Accordion for optional supporting details that a person can reveal on demand. Provide a title that makes the disclosed content predictable, and keep information needed to complete the immediate task visible outside the disclosure.

Use `defaultExpanded` for an independent section. Use `expanded` and `onExpandedChange` when a parent controls one-or-many-open behavior across several sections. Put arbitrary React Native content in `bodyContent`; Accordion does not constrain its layout or navigation.

Choose one chevron layout within a related set for predictable scanning. Do not use Accordion as a navigation control, selected-state indicator, or a substitute for a static section that must always be read.
