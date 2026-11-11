/**
 * Orders text by Unicode code point, so the order is the same in every locale and ICU version. `localeCompare` and
 * `Intl.Collator` follow the host's locale, which would give two machines different shard assignments for one selection.
 * A plain `<` compares UTF-16 code units, which puts characters outside the Basic Multilingual Plane before U+E000-U+FFFF.
 */
export function compareDesktopCodePoints(left: string, right: string): number {
  let leftIndex = 0;
  let rightIndex = 0;
  while (leftIndex < left.length && rightIndex < right.length) {
    const leftPoint = left.codePointAt(leftIndex)!;
    const rightPoint = right.codePointAt(rightIndex)!;
    if (leftPoint !== rightPoint) return leftPoint < rightPoint ? -1 : 1;
    // Equal points advance by equal widths.
    const width = leftPoint > 0xffff ? 2 : 1;
    leftIndex += width;
    rightIndex += width;
  }
  if (leftIndex < left.length) return 1;
  return rightIndex < right.length ? -1 : 0;
}
