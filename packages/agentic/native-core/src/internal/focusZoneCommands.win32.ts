import type NativeFocusZone from '../specs/components/FocusZoneNativeComponent';

export const FocusCommands = {
  requestFocus(
    _view: React.ComponentRef<typeof NativeFocusZone>,
    _generation: number,
    _requestId: number,
    _target: number,
    _strategy: string,
  ): never {
    throw new Error('Modern FocusZone commands are not registered by the Win32 host. Use the legacy native ref API.');
  },
};
