import type { BreadcrumbAncestor, BreadcrumbPartition } from './breadcrumb.types';

export function partitionTrail(
  ancestors: readonly BreadcrumbAncestor[],
  widths: readonly (number | undefined)[],
  available: number,
  gap: number,
  separator: number,
  trigger: number,
): BreadcrumbPartition {
  const all = { leading: ancestors, overflow: [], trailing: [] };
  if (
    ancestors.length < 2 ||
    available <= 0 ||
    !widths.every((width) => width !== undefined) ||
    widths.reduce((total, width) => total + width, gap * 2 * ancestors.length + separator * ancestors.length) <= available
  )
    return all;
  const middle = ancestors.slice(1);
  const joint = gap * 2 + separator;
  let remainder = available - widths[0] - widths[widths.length - 1] - trigger - joint * 2;
  let hidden = middle.length;
  while (hidden > 1 && remainder >= widths[hidden] + joint) {
    remainder -= widths[hidden] + joint;
    hidden--;
  }
  return { leading: ancestors.slice(0, 1), overflow: middle.slice(0, hidden), trailing: middle.slice(hidden) };
}
