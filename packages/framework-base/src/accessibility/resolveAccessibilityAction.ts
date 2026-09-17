import type { AccessibilityActionInfo } from 'react-native';

const actionNames = {
  toggle: { windows: 'toggle', custom: 'Toggle' },
  select: { windows: 'select', custom: 'Select' },
} as const;

export type SemanticAccessibilityAction = keyof typeof actionNames;

/**
 * Resolves a component-owned action and its declarations together. Windows UIA
 * uses lowercase names; Win32 and existing custom-action transports use title case.
 * This declares an action, not support for a platform's default activation gesture.
 */
export function resolveAccessibilityAction(
  action: SemanticAccessibilityAction,
  platform: string,
  actions?: readonly AccessibilityActionInfo[],
): { name: string; accessibilityActions: readonly AccessibilityActionInfo[] } {
  const names = actionNames[action];
  const name = platform === 'windows' ? names.windows : names.custom;
  const merged: AccessibilityActionInfo[] = [];
  const positions = new Map<string, number>();
  let changed = false;

  for (const supplied of actions ?? []) {
    const resolvedName = supplied.name === names.windows || supplied.name === names.custom ? name : supplied.name;
    const position = positions.get(resolvedName);
    if (position !== undefined) {
      // Keep the first declaration and first supplied label for each exact name.
      const previous = merged[position];
      if (previous.label === undefined && supplied.label !== undefined) {
        merged[position] = { ...previous, label: supplied.label };
      }
      changed = true;
    } else {
      positions.set(resolvedName, merged.length);
      merged.push(resolvedName === supplied.name ? supplied : { ...supplied, name: resolvedName });
      changed ||= resolvedName !== supplied.name;
    }
  }

  if (!positions.has(name)) {
    merged.unshift({ name });
    changed = true;
  }

  return { name, accessibilityActions: !changed && actions ? actions : merged };
}
