import type * as React from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

import type { InteractionEvent } from '@fluentui/react-native';

export type DataGridRowId = string | number;
export type DataGridSelectionMode = 'none' | 'single' | 'multiselect';
export type DataGridSelectionAppearance = 'brand' | 'neutral';
export type DataGridSortDirection = 'ascending' | 'descending';
export type DataGridFocusMode = 'composite' | 'cell' | 'none';

export interface DataGridSortState {
  sortColumn: string;
  sortDirection: DataGridSortDirection;
}

export interface DataGridSelectionChangeData {
  selectedItems: Set<DataGridRowId>;
}

export interface DataGridSortChangeData extends DataGridSortState {}

export interface DataGridColumnResizeData {
  columnId: string;
  width: number;
}

export interface DataGridColumnSizingOptions {
  defaultWidth?: number;
  idealWidth?: number;
  maxWidth?: number;
  minWidth?: number;
}

export interface DataGridColumn<TItem> {
  columnId: string;
  compare?: (a: TItem, b: TItem) => number;
  defaultWidth?: number;
  header: React.ReactNode;
  maxWidth?: number;
  minWidth?: number;
  renderCell: (item: TItem) => React.ReactNode;
  sortable?: boolean;
}

export interface DataGridProps<TItem> extends Omit<ViewProps, 'children'> {
  /**
   * Column definitions and cell renderers.
   */
  columns: readonly DataGridColumn<TItem>[];

  /**
   * Per-column sizing overrides used by resizable grids.
   */
  columnSizingOptions?: Readonly<Record<string, DataGridColumnSizingOptions>>;

  /**
   * Initial selected row IDs for an uncontrolled grid.
   */
  defaultSelectedItems?: ReadonlySet<DataGridRowId>;

  /**
   * Initial sort state for an uncontrolled grid.
   */
  defaultSortState?: DataGridSortState;

  /**
   * Sets the native focus behavior for grid cells.
   * @default 'composite'
   */
  focusMode?: DataGridFocusMode;

  /**
   * Returns the stable ID for an item.
   */
  getRowId?: (item: TItem, index: number) => DataGridRowId;

  /**
   * Data rows rendered by the grid.
   */
  items: readonly TItem[];

  /**
   * Maximum rendered rows when virtualization is enabled.
   * @default 10
   */
  maxVisibleRows?: number;

  /**
   * Called after a resizable column changes width.
   */
  onColumnResize?: (event: InteractionEvent, data: DataGridColumnResizeData) => void;

  /**
   * Called after row selection changes.
   */
  onSelectionChange?: (event: InteractionEvent, data: DataGridSelectionChangeData) => void;

  /**
   * Called after the active sort column or direction changes.
   */
  onSortChange?: (event: InteractionEvent, data: DataGridSortChangeData) => void;

  /**
   * Enables pointer-driven column resizing.
   * @default false
   */
  resizableColumns?: boolean;

  /**
   * Controlled selected row IDs.
   */
  selectedItems?: ReadonlySet<DataGridRowId>;

  /**
   * Controls the selected-row background.
   * @default 'brand'
   */
  selectionAppearance?: DataGridSelectionAppearance;

  /**
   * Controls row selection behavior.
   * @default 'none'
   */
  selectionMode?: DataGridSelectionMode;

  /**
   * Enables sorting for columns that provide a compare function.
   * @default false
   */
  sortable?: boolean;

  /**
   * Controlled sort state.
   */
  sortState?: DataGridSortState;

  /**
   * Hides unchecked selection indicators until a row is hovered or focused.
   * @default false
   */
  subtleSelection?: boolean;

  /**
   * Additional style applied to each data row.
   */
  rowStyle?: StyleProp<ViewStyle>;

  /**
   * Renders only a bounded row window for large collections.
   * @default false
   */
  virtualized?: boolean;
}
