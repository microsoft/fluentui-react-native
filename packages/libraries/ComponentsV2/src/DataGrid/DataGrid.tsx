import * as React from 'react';
import type { GestureResponderEvent, PanResponderGestureState, StyleProp, ViewStyle } from 'react-native';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import type { InteractionEvent } from '@fluentui/react-native';

import { Checkbox } from '../Checkbox';
import { dataGridTokens } from './DataGrid.tokens';
import type {
  DataGridColumn,
  DataGridColumnResizeData,
  DataGridProps,
  DataGridRowId,
  DataGridSortState,
} from './DataGrid.types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function ResizeHandle({
  columnId,
  maxWidth,
  minWidth,
  onResize,
  width,
}: {
  columnId: string;
  maxWidth: number;
  minWidth: number;
  onResize: (event: GestureResponderEvent, data: DataGridColumnResizeData) => void;
  width: number;
}): React.ReactElement {
  const startWidth = React.useRef(width);
  React.useEffect(() => {
    startWidth.current = width;
  }, [width]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 2,
        onPanResponderGrant: () => {
          startWidth.current = width;
        },
        onPanResponderMove: (event, gestureState: PanResponderGestureState) => {
          onResize(event, {
            columnId,
            width: clamp(startWidth.current + gestureState.dx, minWidth, maxWidth),
          });
        },
      }),
    [columnId, maxWidth, minWidth, onResize, width],
  );

  return (
    <View
      accessibilityLabel={`Resize ${columnId} column`}
      style={styles.resizeHandle}
      {...panResponder.panHandlers}
    >
      <View style={styles.resizeLine} />
    </View>
  );
}

export function DataGrid<TItem>(props: DataGridProps<TItem>): React.ReactElement {
  const {
    columns,
    columnSizingOptions,
    defaultSelectedItems,
    defaultSortState,
    focusMode = 'composite',
    getRowId = (_item, index) => index,
    items,
    maxVisibleRows = 10,
    onColumnResize,
    onSelectionChange,
    onSortChange,
    resizableColumns = false,
    rowStyle,
    selectedItems,
    selectionAppearance = 'brand',
    selectionMode = 'none',
    sortable = false,
    sortState,
    style,
    subtleSelection = false,
    testID,
    virtualized = false,
    ...rest
  } = props;
  const [internalSelectedItems, setInternalSelectedItems] = React.useState<Set<DataGridRowId>>(
    () => new Set(defaultSelectedItems),
  );
  const [internalSortState, setInternalSortState] = React.useState<DataGridSortState | undefined>(defaultSortState);
  const [hoveredRow, setHoveredRow] = React.useState<DataGridRowId | undefined>();
  const [focusedRow, setFocusedRow] = React.useState<DataGridRowId | undefined>();
  const initialWidths = React.useMemo(
    () =>
      Object.fromEntries(
        columns.map(column => {
          const sizing = columnSizingOptions?.[column.columnId];
          return [column.columnId, sizing?.idealWidth ?? sizing?.defaultWidth ?? column.defaultWidth ?? 150];
        }),
      ),
    [columnSizingOptions, columns],
  );
  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>(initialWidths);
  const currentSelectedItems = selectedItems ?? internalSelectedItems;
  const currentSortState = sortState ?? internalSortState;

  React.useEffect(() => {
    setColumnWidths(current => {
      const next = { ...current };
      for (const [columnId, width] of Object.entries(initialWidths)) {
        if (next[columnId] === undefined) {
          next[columnId] = width;
        }
      }
      return next;
    });
  }, [initialWidths]);

  const requestSelectionChange = React.useCallback(
    (event: InteractionEvent, rowId: DataGridRowId) => {
      if (selectionMode === 'none') {
        return;
      }
      const next = new Set(currentSelectedItems);
      if (selectionMode === 'single') {
        next.clear();
        if (!currentSelectedItems.has(rowId)) {
          next.add(rowId);
        }
      } else if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      if (selectedItems === undefined) {
        setInternalSelectedItems(next);
      }
      onSelectionChange?.(event, { selectedItems: next });
    },
    [currentSelectedItems, onSelectionChange, selectedItems, selectionMode],
  );

  const requestSelectAll = React.useCallback(
    (event: InteractionEvent) => {
      if (selectionMode !== 'multiselect') {
        return;
      }
      const allIds = items.map(getRowId);
      const next = currentSelectedItems.size === allIds.length ? new Set<DataGridRowId>() : new Set(allIds);
      if (selectedItems === undefined) {
        setInternalSelectedItems(next);
      }
      onSelectionChange?.(event, { selectedItems: next });
    },
    [currentSelectedItems.size, getRowId, items, onSelectionChange, selectedItems, selectionMode],
  );

  const requestSortChange = React.useCallback(
    (event: InteractionEvent, column: DataGridColumn<TItem>) => {
      if (!sortable || column.sortable === false || !column.compare) {
        return;
      }
      const next: DataGridSortState = {
        sortColumn: column.columnId,
        sortDirection:
          currentSortState?.sortColumn === column.columnId && currentSortState.sortDirection === 'ascending'
            ? 'descending'
            : 'ascending',
      };
      if (sortState === undefined) {
        setInternalSortState(next);
      }
      onSortChange?.(event, next);
    },
    [currentSortState, onSortChange, sortState, sortable],
  );

  const resizeColumn = React.useCallback(
    (event: InteractionEvent, data: DataGridColumnResizeData) => {
      setColumnWidths(current => ({ ...current, [data.columnId]: data.width }));
      onColumnResize?.(event, data);
    },
    [onColumnResize],
  );

  const sortedItems = React.useMemo(() => {
    if (!currentSortState) {
      return [...items];
    }
    const column = columns.find(candidate => candidate.columnId === currentSortState.sortColumn);
    if (!column?.compare) {
      return [...items];
    }
    const direction = currentSortState.sortDirection === 'ascending' ? 1 : -1;
    return [...items].sort((a, b) => column.compare!(a, b) * direction);
  }, [columns, currentSortState, items]);
  const renderedItems = virtualized ? sortedItems.slice(0, maxVisibleRows) : sortedItems;
  const allSelected = items.length > 0 && currentSelectedItems.size === items.length;
  const someSelected = currentSelectedItems.size > 0 && !allSelected;

  const cellStyle = React.useCallback(
    (column: DataGridColumn<TItem>): StyleProp<ViewStyle> => {
      const sizing = columnSizingOptions?.[column.columnId];
      if (!resizableColumns) {
        return styles.flexCell;
      }
      return {
        flexBasis: columnWidths[column.columnId],
        flexGrow: 0,
        flexShrink: 0,
        maxWidth: sizing?.maxWidth ?? column.maxWidth ?? 400,
        minWidth: sizing?.minWidth ?? column.minWidth ?? 60,
        width: columnWidths[column.columnId],
      };
    },
    [columnSizingOptions, columnWidths, resizableColumns],
  );

  return (
    <View {...rest} style={[styles.root, style]} testID={testID}>
      <View style={[styles.row, styles.headerRow]}>
        {selectionMode === 'multiselect' ? (
          <View style={styles.selectionCell}>
            <Checkbox
              accessibilityLabel="Select all rows"
              checked={allSelected ? true : someSelected ? 'mixed' : false}
              onChange={requestSelectAll}
            />
          </View>
        ) : selectionMode === 'single' ? (
          <View style={styles.selectionCell} />
        ) : null}
        {columns.map(column => {
          const sorted = currentSortState?.sortColumn === column.columnId;
          const canSort = sortable && column.sortable !== false && !!column.compare;
          const sizing = columnSizingOptions?.[column.columnId];
          return (
            <View key={column.columnId} style={[styles.headerCell, cellStyle(column)]}>
              <Pressable
                accessibilityLabel={`${String(column.header)}${sorted ? `, ${currentSortState.sortDirection}` : ''}`}
                accessibilityRole={canSort ? 'button' : undefined}
                disabled={!canSort}
                focusable={focusMode !== 'none'}
                onPress={event => requestSortChange(event, column)}
                style={({ pressed }) => [styles.headerPressable, pressed && canSort && styles.headerPressed]}
              >
                {typeof column.header === 'string' || typeof column.header === 'number' ? (
                  <Text numberOfLines={1} style={styles.headerText}>
                    {column.header}
                    {sorted ? (currentSortState.sortDirection === 'ascending' ? '  ▲' : '  ▼') : ''}
                  </Text>
                ) : (
                  column.header
                )}
              </Pressable>
              {resizableColumns ? (
                <ResizeHandle
                  columnId={column.columnId}
                  maxWidth={sizing?.maxWidth ?? column.maxWidth ?? 400}
                  minWidth={sizing?.minWidth ?? column.minWidth ?? 60}
                  onResize={resizeColumn}
                  width={columnWidths[column.columnId]}
                />
              ) : null}
            </View>
          );
        })}
      </View>
      {renderedItems.map((item, index) => {
        const rowId = getRowId(item, index);
        const selected = currentSelectedItems.has(rowId);
        const showSubtleIndicator = !subtleSelection || selected || hoveredRow === rowId || focusedRow === rowId;
        return (
          <Pressable
            accessibilityLabel={`Row ${String(rowId)}`}
            accessibilityRole={selectionMode === 'multiselect' ? 'checkbox' : selectionMode === 'single' ? 'radio' : 'button'}
            accessibilityState={{ checked: selectionMode === 'none' ? undefined : selected, selected }}
            focusable={focusMode !== 'none'}
            key={rowId}
            onBlur={() => setFocusedRow(current => (current === rowId ? undefined : current))}
            onFocus={() => setFocusedRow(rowId)}
            onHoverIn={() => setHoveredRow(rowId)}
            onHoverOut={() => setHoveredRow(current => (current === rowId ? undefined : current))}
            onPress={event => requestSelectionChange(event, rowId)}
            style={({ pressed }) => [
              styles.row,
              styles.dataRow,
              (hoveredRow === rowId || pressed) && styles.hoveredRow,
              selected &&
                (selectionAppearance === 'neutral' ? styles.neutralSelectedRow : styles.brandSelectedRow),
              rowStyle,
            ]}
          >
            {selectionMode !== 'none' ? (
              <View style={styles.selectionCell}>
                {showSubtleIndicator ? (
                  <Checkbox
                    accessibilityLabel={`Select row ${String(rowId)}`}
                    checked={selected}
                    onChange={event => {
                      event.stopPropagation();
                      requestSelectionChange(event, rowId);
                    }}
                    shape={selectionMode === 'single' ? 'circular' : 'square'}
                  />
                ) : null}
              </View>
            ) : null}
            {columns.map(column => {
              const content = column.renderCell(item);
              return (
                <View key={column.columnId} style={[styles.cell, cellStyle(column)]}>
                  {typeof content === 'string' || typeof content === 'number' ? (
                    <Text numberOfLines={1} style={styles.cellText}>
                      {content}
                    </Text>
                  ) : (
                    content
                  )}
                </View>
              );
            })}
          </Pressable>
        );
      })}
      {virtualized && sortedItems.length > renderedItems.length ? (
        <Text style={styles.virtualizedLabel}>
          Showing {renderedItems.length} of {sortedItems.length} rows
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  brandSelectedRow: {
    backgroundColor: dataGridTokens.brandSelectionBackground,
  },
  cell: {
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: 0,
    paddingHorizontal: dataGridTokens.cellPaddingHorizontal,
  },
  cellText: {
    color: dataGridTokens.foreground,
    fontFamily: 'Segoe UI',
    fontSize: 14,
  },
  dataRow: {
    minHeight: dataGridTokens.rowHeight,
  },
  flexCell: {
    flex: 1,
  },
  headerCell: {
    alignItems: 'stretch',
    flexDirection: 'row',
    minWidth: 0,
  },
  headerPressable: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
    paddingHorizontal: dataGridTokens.cellPaddingHorizontal,
  },
  headerPressed: {
    backgroundColor: dataGridTokens.headerPressedBackground,
  },
  headerRow: {
    minHeight: dataGridTokens.headerHeight,
  },
  headerText: {
    color: dataGridTokens.foreground,
    fontFamily: 'Segoe UI',
    fontSize: 14,
    fontWeight: '600',
  },
  hoveredRow: {
    backgroundColor: dataGridTokens.hoverBackground,
  },
  neutralSelectedRow: {
    backgroundColor: dataGridTokens.neutralSelectionBackground,
  },
  resizeHandle: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    width: 10,
  },
  resizeLine: {
    backgroundColor: '#c7c7c7',
    height: 20,
    width: 1,
  },
  root: {
    borderColor: dataGridTokens.borderColor,
    borderTopWidth: 1,
    minWidth: 400,
  },
  row: {
    borderBottomColor: dataGridTokens.borderColor,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  selectionCell: {
    alignItems: 'center',
    justifyContent: 'center',
    width: dataGridTokens.selectionCellWidth,
  },
  virtualizedLabel: {
    color: '#616161',
    fontFamily: 'Segoe UI',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
