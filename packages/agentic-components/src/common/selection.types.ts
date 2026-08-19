/**
 * Public props for a `selected` state axis that supports both an externally driven caller and internally driven
 * presses.
 *
 * Supply `selected` to own the value externally, `defaultSelected` to seed the internally driven value, or
 * `onSelectedChange` to observe state change events. Supplying any of the three opts the component into the selection
 * axis, which lets a component distinguish an omitted axis from an explicit `selected={false}`.
 *
 * Whether a press toggles selection off again or only ever selects is a per-component decision documented in that
 * component's `SPEC.md`.
 */
export type SelectionStateProps = {
  /**
   * The externally driven selected value. While this is supplied the component renders what it is given and reports
   * presses through `onSelectedChange` instead of changing state itself.
   */
  selected?: boolean;

  /**
   * The initial selected value when selection is internally driven. Ignored while `selected` is supplied.
   */
  defaultSelected?: boolean;

  /**
   * Called with the next selected value whenever an interaction changes selection, in both the externally driven and
   * internally driven cases.
   */
  onSelectedChange?: (selected: boolean) => void;
};

/**
 * The selection props that describe how the axis is driven rather than its resolved value. Resolved component state
 * keeps `selected` and drops these.
 */
export type SelectionDriverKeys = 'defaultSelected' | 'onSelectedChange';
