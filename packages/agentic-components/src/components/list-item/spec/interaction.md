---
component: ListItem
platform: react-native (Windows, macOS)
---

# ListItem Interaction (React Native — Windows & macOS)

The parent `flex-components:list` owns the keyboard model and moves DOM focus between rows via its `navigationMode` (`items` or `composite`). ListItem handles only its own activation key (Enter via `onAction`) and renders the focus ring on `:focus-visible`.

## Keyboard navigation

- **Enter** — fires the row's `onAction`. When the parent List's Selection mode is Single or Multiple, Enter also toggles the row's Selected state **unless** `onAction` calls its prevention API.
- **Space** — when the parent's Selection mode is Single or Multiple, Space toggles the row's Selected state. **Space always toggles selection** regardless of `onAction`. When Selection mode is None, Space activates the row (same as Enter, per the parent List's contract).
- **Clicking the embedded Checkbox/Radio selection indicator** always toggles selection regardless of `onAction`.
- **Arrow Up / Arrow Down / Home / End / Tab / type-ahead** — handled by the parent List. ListItem does not implement its own arrow-key, Home/End, or tab handlers.
- **Arrow Right / Arrow Left (composite mode only)** — handled by the parent List. The parent moves focus into / through the row's inner focusables (Action items, embedded controls).

Disabled rows are skipped by the parent's navigation cycle.

## Focus management

ListItem rows receive **real DOM focus** from the parent List. The parent moves focus between rows (and onto the initially-focused row when the List is entered) by calling `.focus()` on the row's interactive element.

- **Focus ring** — ListItem renders the universal dual-outline focus ring (see `flex-system:styling`) when its interactive element matches `:focus-visible`. The ring is absolutely positioned over the row and overlays content without affecting layout dimensions.
- **No self-managed `tabindex`.** The parent List controls roving tabindex: typically the focused row carries `tabindex="0"` while the rest carry `tabindex="-1"`. ListItem must not set its own `tabindex`.
- **Inner focusables in composite mode.** When the parent List is in `navigationMode="composite"`, Action items and any other inner focusables receive their own DOM focus and render their own `:focus-visible` rings. Composite rows must follow the accessibility wrapper contract documented in `accessibility.md`; ListItem provides the slot but does not enforce the wrapper.

## Activation contract

- **Use `onAction`, not `onClick`.** `onAction` registers click, Enter, and (when Selection mode = None) Space, and coordinates with selection toggling. `onClick` does not fire on keyboard activation; treat any use of `onClick` on a ListItem as a bug.
- **Action items in the Trailing container have their own activation.** Activating a trailing action button (via click or keyboard) must not propagate to the row's `onAction` or toggle the row's Selected state. Stop event propagation at the action button.

## Animation

State transitions (Rest → Hover, Selected toggling, focus moving between rows) are platform-driven color transitions. Duration and easing reference motion tokens once defined. Keep transitions short (≤150ms) so the focus ring does not trail when a user holds an arrow key on a long list.

The Selected font-weight swap (Regular → Semibold on the primary label) and the leading icon Regular → Filled swap are **instant** — they have no transition. The ghost Semibold node in the primary label's layout already reserves Semibold width, so the swap does not reflow the row.

> **Reduced motion:** When the OS reduce-motion setting is set, all row transitions should be instant. No scale, translate, or opacity animation is used on ListItem.
