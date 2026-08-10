# DataGrid native specification

## Fluent UI Web references

- `packages/react-components/react-table/library/src/components/DataGrid`
- `packages/react-components/react-table/library/src/hooks/useTableFeatures.ts`
- `packages/react-components/react-table/stories/src/DataGrid`
- Fluent UI React Storybook `Components/DataGrid`

## Native design

`DataGrid` renders typed column definitions and item data as native header and row surfaces. Sorting, selection, and column widths support controlled or uncontrolled state. Selection indicators use the ComponentsV2 `Checkbox`; cells accept arbitrary React Native content for avatars, icons, buttons, and grouped actions.

Large data sets use a bounded native row window rather than nesting another scroll host inside the ReactTest catalog scroll view.

## Implemented behaviors

- Typed columns with custom headers, cell renderers, comparators, and sizing constraints.
- Controlled and uncontrolled ascending/descending sorting.
- Controlled and uncontrolled single or multiple row selection.
- Brand and neutral selected-row appearances.
- Subtle selection indicators shown for selected, hovered, or focused rows.
- Select-all checkbox with checked and mixed states.
- Pointer-driven column resizing with minimum and maximum widths.
- Stable custom row IDs.
- Composite, cell, and disabled focus modes.
- Arbitrary focusable content within cells.
- Bounded rendering for virtualized story data.

## Behaviors not implemented

| Web behavior | Reason not implemented natively |
| --- | --- |
| DOM table semantics and `aria-rowindex` | React Native exposes native accessibility roles and state rather than HTML table elements. |
| Browser context menus for keyboard resize mode | Native resizing uses direct pointer gestures; host menus can be composed around headers when required. |
| `react-window` integration | The Web story delegates to a separate iframe package. Native hosts own their virtualization strategy; this control provides a bounded row window. |
| CSS auto-fit column measurement | Native text measurement differs by host; explicit and ideal widths are deterministic across Win32 scaling. |
| Browser-specific arrow-key focus trapping | Native focus is delegated to platform focusable row and cell content. |

## Exposed property mappings

| Fluent UI Web property | React Native property | Web type/default | Native type/default | Mapping or adaptation |
| --- | --- | --- | --- | --- |
| `items` | `items` | `TItem[]` | `readonly TItem[]` | Direct mapping. |
| `columns` | `columns` | table column definitions | `DataGridColumn<TItem>[]` | Native headers, renderers, comparators, and widths. |
| `getRowId` | `getRowId` | item callback | item/index callback | Direct stable-ID mapping. |
| `selectionMode` | `selectionMode` | `single`, `multiselect` | adds `none`; default `none` | Direct selection behavior. |
| `defaultSelectedItems` | `defaultSelectedItems` | `Set<TableRowId>` | `ReadonlySet<DataGridRowId>` | Uncontrolled initial state. |
| `selectedItems` | `selectedItems` | `Set<TableRowId>` | `ReadonlySet<DataGridRowId>` | Controlled selection. |
| `onSelectionChange` | `onSelectionChange` | event and data | native interaction event and data | Equivalent callback. |
| `sortable` | `sortable` | boolean / false | same | Columns additionally require `compare`. |
| `defaultSortState` | `defaultSortState` | sort state | same | Uncontrolled initial sort. |
| `sortState` | `sortState` | sort state | same | Controlled sort. |
| `onSortChange` | `onSortChange` | event and data | native event and data | Equivalent callback. |
| `focusMode` | `focusMode` | composite variants | `composite`, `cell`, `none` | Native focus adaptation. |
| `subtleSelection` | `subtleSelection` | boolean / false | same | Indicator visibility mapping. |
| `selectionAppearance` | `selectionAppearance` | brand/neutral | same | Direct visual mapping. |
| `resizableColumns` | `resizableColumns` | boolean / false | same | Native pan gesture resizing. |
| `columnSizingOptions` | `columnSizingOptions` | sizing map | native sizing map | Supports default, ideal, min, and max width. |

## Native-only properties

| Native property | Type/default | Rationale |
| --- | --- | --- |
| `virtualized` | boolean / false | Enables bounded row rendering without a nested native scroll host. |
| `maxVisibleRows` | number / 10 | Configures the native row window. |
| `rowStyle` | `StyleProp<ViewStyle>` | Allows host-specific row geometry without exposing DOM slots. |
| `onColumnResize` | native event and width data | Reports pointer-driven native resizing. |

## Web properties not exposed

| Fluent UI Web property | Web purpose | Reason omitted from native API |
| --- | --- | --- |
| `children` render slots | DOM component composition | Native columns and items provide a smaller typed composition API. |
| `resizableColumnsOptions.autoFitColumns` | Browser layout measurement | Native widths are explicit and deterministic. |
| HTML table attributes | DOM semantics | Not applicable to React Native. |
| `as` and slot overrides | DOM element replacement | Native content is customized through headers and renderers. |

## Accessibility

Sortable headers are named buttons with the active sort direction. Selectable rows expose checkbox or radio state, select-all exposes mixed state, and resize handles have column-specific labels. Focusable cell content remains directly reachable through native focus navigation.

## Motion and animation mapping

| Web transition or animation | Native implementation | Duration/easing | Reduced-motion behavior |
| --- | --- | --- | --- |
| Hover and selected backgrounds | Immediate native state change | None | No motion. |
| Column resizing | Gesture-following width update | Direct manipulation | No motion. |

## Tests and Storybook coverage

Unit tests cover sorting, single and multiple selection, callbacks, and bounded virtualization. The catalog maps all 15 Fluent UI Web DataGrid stories and validates each rendered instance for visuals, sorting, selection, focusable actions, custom IDs, resizing, and virtualization.
