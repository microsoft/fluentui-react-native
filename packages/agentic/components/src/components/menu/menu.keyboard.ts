import type { FocusKeyboardEvent } from '@fluentui-react-native/framework-base';

export type MenuNavigationItem = { itemId: string; disabled: boolean; textValue: string; submenu: boolean };
export type MenuKeyResult = { kind: 'focus'; itemId: string } | { kind: 'open' } | { kind: 'back' };

export function menuKeyDestination(
  items: readonly MenuNavigationItem[],
  itemId: string,
  event: FocusKeyboardEvent,
  rtl: boolean,
  child: boolean,
): MenuKeyResult | undefined {
  if (event.defaultPrevented) return undefined;
  const native = event.nativeEvent;
  if (native.altKey || native.ctrlKey || native.metaKey) return undefined;
  const key = native.key ?? native.code;
  const eligible = items.filter((item) => !item.disabled);
  const index = eligible.findIndex((item) => item.itemId === itemId);
  if (index < 0) return undefined;
  const current = eligible[index];
  if (!native.shiftKey) {
    if (key === (rtl ? 'ArrowLeft' : 'ArrowRight') && current.submenu) return { kind: 'open' };
    if (key === (rtl ? 'ArrowRight' : 'ArrowLeft') && child) return { kind: 'back' };
    const next =
      key === 'Home'
        ? 0
        : key === 'End'
          ? eligible.length - 1
          : key === 'ArrowDown'
            ? (index + 1) % eligible.length
            : key === 'ArrowUp'
              ? (index + eligible.length - 1) % eligible.length
              : undefined;
    if (next !== undefined) return { kind: 'focus', itemId: eligible[next].itemId };
  }
  if (!native.key || [...native.key].length !== 1 || native.key.trim() === '') return undefined;
  const character = native.key.toLocaleLowerCase();
  for (let offset = 1; offset <= eligible.length; offset++) {
    const candidate = eligible[(index + offset) % eligible.length];
    if (candidate.textValue.trimStart().toLocaleLowerCase().startsWith(character)) {
      return { kind: 'focus', itemId: candidate.itemId };
    }
  }
  return undefined;
}

export const menuNavigationKeyProps = {
  keyDownEvents: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].map((key) => ({
    key,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
  })),
};

export type MenuScreenPoint = { screenX: number; screenY: number; pointerId: string };
