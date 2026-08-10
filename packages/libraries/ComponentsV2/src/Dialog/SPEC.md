# Dialog native specification

`Dialog` maps Fluent UI Web controlled and uncontrolled open state, modal, non-modal, and alert behavior, backdrop appearance, title actions, action rows, and prevented close behavior to an inline native overlay surface. The inline surface avoids opening multiple host-level windows when all Storybook examples render together.

The trigger, close button, and non-modal backdrop publish `onOpenChange` reasons. Modal content uses `accessibilityViewIsModal`; alert dialogs expose the native alert role.

Browser focus trapping, DOM portal placement, and CSS motion customization remain host responsibilities.
