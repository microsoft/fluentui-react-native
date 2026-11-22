# ToggleButton migration

Use ToggleButton for a persistent option, Button for a one-time command, and Switch for a settings control.

```tsx
// Existing Subtle Button; its caller currently changes the value from onPress.
<Button appearance="subtle" content="Bold" selected={bold} icon={regularBold} selectedIcon={filledBold} onPress={() => setBold(!bold)} />

// Controlled replacement. The name describes the option, not its next action.
<ToggleButton content="Bold" selected={bold} onSelectedChange={setBold} leadingIcon={regularBold} selectedLeadingIcon={filledBold} />

// Uncontrolled icon-only option. Circular is explicit.
<ToggleButton accessibilityLabel="Show grid" leadingIcon={gridIcon} shape="circular" defaultSelected />
```

Move the state update from `onPress` **and** any custom Toggle action handler to `onSelectedChange`; do not keep both
updates. A labeled `iconPosition="after"` maps to `trailingIcon` and `selectedTrailingIcon`. An icon-only button
uses the leading slots. The old `circle` spelling becomes `circular`; icon-only no longer implies it.

Selected Button callers that omit `appearance` use **Secondary**, not Subtle. Review those along with explicit
Primary, Secondary, Outline and square callers for an intentional appearance change or another design. Do not
silently migrate those call sites and claim the same appearance.
