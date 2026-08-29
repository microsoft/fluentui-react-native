import { createThemeAppearanceSource } from './appearanceSource';

describe('createThemeAppearanceSource', () => {
  it('keeps snapshot identity stable until a semantic value changes', () => {
    let colorScheme: 'light' | 'dark' = 'light';
    let notifyNative = () => undefined;
    const unsubscribeNative = jest.fn();
    const source = createThemeAppearanceSource(
      () => ({ colorScheme }),
      (listener) => {
        notifyNative = listener;
        return unsubscribeNative;
      },
    );
    const listener = jest.fn();
    const unsubscribe = source.subscribe(listener);
    const initial = source.getSnapshot();

    notifyNative();
    expect(source.getSnapshot()).toBe(initial);
    expect(listener).not.toHaveBeenCalled();

    colorScheme = 'dark';
    notifyNative();
    expect(source.getSnapshot()).not.toBe(initial);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    expect(unsubscribeNative).toHaveBeenCalledTimes(1);
  });

  it('shares one native subscription across consumers', () => {
    const subscribeNative = jest.fn(() => () => undefined);
    const source = createThemeAppearanceSource(() => ({}), subscribeNative);
    const first = source.subscribe(() => undefined);
    const second = source.subscribe(() => undefined);

    expect(subscribeNative).toHaveBeenCalledTimes(1);
    first();
    expect(subscribeNative).toHaveBeenCalledTimes(1);
    second();
  });

  it('notifies every subscriber when a read observes a change before the native event', () => {
    let colorScheme: 'light' | 'dark' = 'light';
    let notifyNative = () => undefined;
    const source = createThemeAppearanceSource(
      () => ({ colorScheme }),
      (listener) => {
        notifyNative = listener;
        return () => undefined;
      },
    );
    const firstListener = jest.fn();
    const secondListener = jest.fn();
    source.subscribe(firstListener);
    source.subscribe(secondListener);

    colorScheme = 'dark';
    expect(source.getSnapshot().colorScheme).toBe('dark');
    expect(firstListener).not.toHaveBeenCalled();
    expect(secondListener).not.toHaveBeenCalled();

    notifyNative();
    expect(firstListener).toHaveBeenCalledTimes(1);
    expect(secondListener).toHaveBeenCalledTimes(1);
  });
});
