/**
 * Clears a renderer's record that a host instance owns text-input focus.
 * Runtimes without React Native keep no such record.
 */
export function releaseHostFocusRecord(_instance: object): void {
  // Intentionally empty outside React Native.
}
