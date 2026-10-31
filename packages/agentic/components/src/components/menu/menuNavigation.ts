/** A focus stop that type-ahead can choose. */
export interface MenuTypeAheadRow {
  id: string;
  text: string;
  focusable: boolean;
}

/** Returns the printable character a key event types, ignoring modified keys, or undefined. */
export function getTypeAheadCharacter(event: { key?: string; altKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }): string | undefined {
  const { key } = event;
  if (!key || event.altKey || event.ctrlKey || event.metaKey || [...key].length !== 1 || key.trim() === '') {
    return undefined;
  }
  return key;
}

/**
 * The next focus stop after `currentId`, wrapping, whose label starts with `character` without regard to case. With
 * no current row the search starts at the first row.
 */
export function findTypeAheadRow<T extends MenuTypeAheadRow>(
  rows: readonly T[],
  currentId: string | null,
  character: string,
): T | undefined {
  const needle = character.toLocaleLowerCase();
  const start = rows.findIndex((row) => row.id === currentId);
  for (let offset = 1; offset <= rows.length; offset++) {
    const row = rows[(start + offset + rows.length) % rows.length];
    if (row.focusable && row.text.trimStart().toLocaleLowerCase().startsWith(needle)) {
      return row;
    }
  }
  return undefined;
}

/** The arrow keys that open and close submenus, which follow layout direction. */
export function getInlineArrows(rtl: boolean): { open: string; close: string } {
  return rtl ? { open: 'ArrowLeft', close: 'ArrowRight' } : { open: 'ArrowRight', close: 'ArrowLeft' };
}
