import type {
  TextProps as Win32PlatformTextProps,
  ViewProps as Win32PlatformViewProps,
  ImageProps as Win32PlatformImageProps,
} from '@office-iss/react-native-win32';
import type {
  TextProps as MacOSPlatformTextProps,
  ViewProps as MacOSPlatformViewProps,
  ImageProps as MacOSPlatformImageProps,
} from 'react-native-macos';
import type {
  TextProps as WindowsPlatformTextProps,
  ViewProps as WindowsPlatformViewProps,
  ImageProps as WindowsPlatformImageProps,
} from 'react-native-windows';

import type { IAdapterMacOSViewProps, IAdapterMacOSTextProps, IAdapterMacOSImageProps } from '../adapter.types.macos';
import type { IAdapterWin32ViewProps, IAdapterWin32TextProps, IAdapterWin32ImageProps } from '../adapter.types.win32';
import type { IAdapterWindowsViewProps, IAdapterWindowsTextProps, IAdapterWindowsImageProps } from '../adapter.types.windows';
import { filterViewProps, filterTextProps, filterImageProps } from '../adapters';

describe('Base filter tests', () => {
  test('filterTextProps works', () => {
    expect(filterTextProps('foo')).toBeFalsy();
    expect(filterTextProps('children')).toBeTruthy();
    expect(filterTextProps('style')).toBeTruthy();
    expect(filterTextProps('accessible')).toBeTruthy();
  });

  test('filterViewProps works', () => {
    expect(filterViewProps('foo')).toBeFalsy();
    expect(filterViewProps('children')).toBeTruthy();
    expect(filterViewProps('style')).toBeTruthy();
    expect(filterViewProps('accessible')).toBeTruthy();
    expect(filterViewProps('animationClass')).toBeTruthy();
  });

  test('filterImageProps works', () => {
    expect(filterImageProps('foo')).toBeFalsy();
    expect(filterImageProps('children')).toBeTruthy();
    expect(filterImageProps('style')).toBeTruthy();
    expect(filterImageProps('accessible')).toBeTruthy();
  });

  test('verify win32 types', () => {
    const win32AdapterViewProps = {} as Required<IAdapterWin32ViewProps>;
    // This assignment will fail if we are missing properties on IAdapterWin32ViewProps which are defined by Win32PlatformViewProps
    const win32PlatformViewProps: Required<Win32PlatformViewProps> = win32AdapterViewProps;
    expect(Object.keys(win32PlatformViewProps).length).toBe(0);

    // This assignment will fail if there are any extra properties on IAdapterWin32ViewProps which are not defined by Win32PlatformViewProps
    const emptyWin32ViewProps: Omit<Required<IAdapterWin32ViewProps>, keyof Win32PlatformViewProps> = {};
    expect(Object.keys(emptyWin32ViewProps).length).toBe(0);

    const win32AdapterTextProps = {} as Required<IAdapterWin32TextProps>;
    // This assignment will fail if we are missing properties on IAdapterWin32TextProps which are defined by Win32PlatformTextProps
    const win32PlatformTextProps: Required<Win32PlatformTextProps> = win32AdapterTextProps;
    expect(Object.keys(win32PlatformTextProps).length).toBe(0);

    // This assignment will fail if there are any extra properties on IAdapterWin32TextProps which are not defined by Win32PlatformTextProps
    const emptyWin32TextProps: Omit<Required<IAdapterWin32TextProps>, keyof Win32PlatformTextProps> = {};
    expect(Object.keys(emptyWin32TextProps).length).toBe(0);

    const win32AdapterImageProps = {} as Required<IAdapterWin32ImageProps>;
    // This assignment will fail if we are missing properties on IAdapterWin32ImageProps which are defined by Win32PlatformImageProps
    const win32PlatformImageProps: Required<Win32PlatformImageProps> = win32AdapterImageProps;
    expect(Object.keys(win32PlatformImageProps).length).toBe(0);

    // This assignment will fail if there are any extra properties on IAdapterWin32ImageProps which are not defined by Win32PlatformImageProps
    const emptyWin32ImageProps: Omit<Required<IAdapterWin32ImageProps>, keyof Win32PlatformImageProps> = {};
    expect(Object.keys(emptyWin32ImageProps).length).toBe(0);
  });

  // EventPhase enum mismatch - https://github.com/microsoft/react-native-windows/pull/12909 should fix
  type windowsEventPhaseInvalidProperties = 'onKeyDown' | 'onKeyDownCapture' | 'onKeyUp' | 'onKeyUpCapture';

  // Need to unify win32/windows key*Events
  type windowsHandledKeyInvalidProperties = 'keyDownEvents' | 'keyUpEvents';

  test('verify windows types', () => {
    const windowsAdapterViewProps = {} as Required<IAdapterWindowsViewProps>;
    // This assignment will fail if we are missing properties on IAdapterWindowsViewProps which are defined by WindowsPlatformViewProps
    const windowsPlatformViewProps: Required<
      Omit<WindowsPlatformViewProps, windowsEventPhaseInvalidProperties | windowsHandledKeyInvalidProperties>
    > = windowsAdapterViewProps;
    expect(Object.keys(windowsPlatformViewProps).length).toBe(0);

    // This assignment will fail if there are any extra properties on IAdapterWindowsViewProps which are not defined by WindowsPlatformViewProps
    const emptyWindowsViewProps: Omit<Required<IAdapterWindowsViewProps>, keyof WindowsPlatformViewProps> = {};
    expect(Object.keys(emptyWindowsViewProps).length).toBe(0);

    const windowsAdapterTextProps = {} as Required<IAdapterWindowsTextProps>;
    // This assignment will fail if we are missing properties on IAdapterWindowsTextProps which are defined by WindowsPlatformTextProps
    const windowsPlatformTextProps: Required<WindowsPlatformTextProps> = windowsAdapterTextProps;
    expect(Object.keys(windowsPlatformTextProps).length).toBe(0);

    // This assignment will fail if there are any extra properties on IAdapterWindowsTextProps which are not defined by WindowsPlatformTextProps
    const emptyWindowsTextProps: Omit<Required<IAdapterWindowsTextProps>, keyof WindowsPlatformTextProps> = {};
    expect(Object.keys(emptyWindowsTextProps).length).toBe(0);

    const windowsAdapterImageProps = {} as Required<IAdapterWindowsImageProps>;
    // This assignment will fail if we are missing properties on IAdapterWindowsImageProps which are defined by WindowsPlatformImageProps
    const windowsPlatformImageProps: Required<WindowsPlatformImageProps> = windowsAdapterImageProps;
    expect(Object.keys(windowsPlatformImageProps).length).toBe(0);

    // This assignment will fail if there are any extra properties on IAdapterWindowsImageProps which are not defined by WindowsPlatformImageProps
    const emptyWindowsImageProps: Omit<Required<IAdapterWindowsImageProps>, keyof WindowsPlatformImageProps> = {};
    expect(Object.keys(emptyWindowsImageProps).length).toBe(0);
  });

  test('verify macOS types', () => {
    const macOSAdapterViewProps = {} as Required<IAdapterMacOSViewProps>;
    // This assignment will fail if we are missing properties on IAdapterMacOSViewProps which are defined by MacOSPlatformViewProps
    const macOSPlatformViewProps: Required<MacOSPlatformViewProps> = macOSAdapterViewProps;
    expect(Object.keys(macOSPlatformViewProps).length).toBe(0);

    // This assignment will fail if there are any extra properties on IAdapterMacOSViewProps which are not defined by MacOSPlatformViewProps
    const emptyMacOSViewProps: Omit<Required<IAdapterMacOSViewProps>, keyof MacOSPlatformViewProps> = {};
    expect(Object.keys(emptyMacOSViewProps).length).toBe(0);

    const macOSAdapterTextProps = {} as Required<IAdapterMacOSTextProps>;
    // This assignment will fail if we are missing properties on IAdapterMacOSTextProps which are defined by MacOSPlatformTextProps
    const macOSPlatformTextProps: Required<MacOSPlatformTextProps> = macOSAdapterTextProps;
    expect(Object.keys(macOSPlatformTextProps).length).toBe(0);

    // This assignment will fail if there are any extra properties on IAdapterMacOSTextProps which are not defined by MacOSPlatformTextProps
    const emptyMacOSTextProps: Omit<Required<IAdapterMacOSTextProps>, keyof MacOSPlatformTextProps> = {};
    expect(Object.keys(emptyMacOSTextProps).length).toBe(0);

    const macOSAdapterImageProps = {} as Required<IAdapterMacOSImageProps>;
    // This assignment will fail if we are missing properties on IAdapterMacOSImageProps which are defined by MacOSPlatformImageProps
    const macOSPlatformImageProps: Required<MacOSPlatformImageProps> = macOSAdapterImageProps;
    expect(Object.keys(macOSPlatformImageProps).length).toBe(0);

    // This assignment will fail if there are any extra properties on IAdapterMacOSImageProps which are not defined by MacOSPlatformImageProps
    const emptyMacOSImageProps: Omit<Required<IAdapterMacOSImageProps>, keyof MacOSPlatformImageProps> = {};
    expect(Object.keys(emptyMacOSImageProps).length).toBe(0);
  });
});
