---
name: drawer
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Drawer

## Scope

An edge-aligned panel for supporting content. Inline consumes space in layout. Overlay has a distinct native
presentation, which may be nonmodal, modal or alert; opening an inline panel never establishes a modal scope.

## Public contract

| Proposed prop                       | Default                                     | Purpose                                                                                                                               |
| ----------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `presentation / modality`           | `inline` / `modal` for overlays             | inline or overlay; overlay accepts nonmodal, modal or alert. Modality has no effect on inline layout.                                 |
| `position / size`                   | `start` / `medium`                          | Logical start, end or bottom. small, medium, large, full or custom; custom extent must be positive and respect available owner space. |
| `open / defaultOpen / onOpenChange` | uncontrolled, closed                        | Report requested next presence with the user reason; a layout-mode change is not a second open action.                                |
| `title / children / footer`         | required accessible title / body / optional | Close button needs a localized name when present. Alert needs an explicit resolving action, not an accidental backdrop exit.          |

### Slots and ownership

Structural View ref, header/navigation, scrollable body, optional footer and separator. Inline is a sibling of
main content; overlay adds a separate owned surface, and only a blocking mode adds a blocking backdrop.

Related contracts used by this design: [Dialog](../dialog/SPEC.md), [Button](../button/SPEC.md), [Divider](../divider/SPEC.md).

### Data and callbacks

For start/end panels, small, medium and large prefer 320, 592 and 940 logical units within the available owner
extent. `customSize` supplies the custom extent; a bottom panel measures the block axis rather than applying
side-panel width as height. A modal scrim can request close; alert rejects it and nonmodal/inline do not install
one.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **DWR-001:** Keep presence, layout presentation and modality separate. A responsive transition must not remount editable body contents or reissue an accepted action merely to change geometry.
- **DWR-002:** Inline permits natural Tab exit. On explicit inline close choose a live main-content destination; overlay Escape restores its opener when appropriate. Alert closes only by explicit resolution.
- **DWR-003:** Block background input and accessibility only for modal/alert, using the same qualified scope as Dialog. Nonmodal leaves the rest of the window operable.
- **DWR-004:** Resolve start/end in RTL, clamp extent to actual host dimensions, and keep body scrolling and footer actions usable at enlarged text sizes.

## Platform behavior

Inline review and implementation can proceed without modal infrastructure. For modal resize transitions require
actual isolation acquisition/release, including owner loss; do not silently present a modal-labelled Drawer
through a nonmodal Callout.

## Divergences from Flex

- `drawer-mode-admission` — **deferred.** Gate true modal overlays on native focus and background isolation (#4379); an inline pass proves neither.
- `owner-sized-drawer` — **accepted.** Measure the native owner and logical edge rather than using page viewport dimensions.

## Conformance

Resize with an editor focused inside, then close via Escape, backdrop and explicit alert action. Inspect
isolation, orientation and focus return separately for each supported mode.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
