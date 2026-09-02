# Text interaction

Text adds no interaction state machine. It forwards native press callbacks,
selection behavior, responder props, disabled state, and event ordering to the
React Native Text implementation.

Theme defaults do not change across interaction states. Components that use
Text as a content slot own their hover, press, focus, selection, and disabled
foreground styles.
