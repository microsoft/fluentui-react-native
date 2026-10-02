const navigationKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'] as const;

// Win32's shipped Flow/runtime use code + handledEventPhase, unlike its stale
// key + eventPhase declaration. Fabric uses the same representation.
export function getToolbarKeyProps(platform: string, enabled: boolean) {
  if (!enabled) {
    return {};
  }
  const modifiers = { altKey: false, ctrlKey: false, metaKey: false, shiftKey: false };
  if (platform === 'macos') {
    return { keyDownEvents: navigationKeys.map((key) => ({ key, ...modifiers })) };
  }
  if (platform === 'windows' || platform === 'win32') {
    return { keyDownEvents: navigationKeys.map((code) => ({ code, handledEventPhase: 3, ...modifiers })) };
  }
  return {};
}
