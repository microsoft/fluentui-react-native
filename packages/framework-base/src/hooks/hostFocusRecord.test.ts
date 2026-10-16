import { TextInput } from 'react-native';

import { releaseHostFocusRecord } from './hostFocusRecord';

type FocusRecord = { currentlyFocusedInput: () => unknown; onTextInputBlur?: (instance: unknown) => void };

describe('releaseHostFocusRecord', () => {
  const statics = TextInput as unknown as { State?: FocusRecord };
  const original = statics.State;
  afterEach(() => {
    statics.State = original;
  });

  function useRecord(focused: unknown, withDispatchFreeBlur = true) {
    let current = focused;
    const onTextInputBlur = jest.fn((instance: unknown) => {
      if (current === instance) {
        current = null;
      }
    });
    statics.State = {
      currentlyFocusedInput: () => current,
      ...(withDispatchFreeBlur ? { onTextInputBlur } : {}),
    };
    return { current: () => current, onTextInputBlur };
  }

  it('clears the record for the recorded host without dispatching', () => {
    const host = {};
    const record = useRecord(host);
    releaseHostFocusRecord(host);
    expect(record.onTextInputBlur).toHaveBeenCalledWith(host);
    expect(record.current()).toBeNull();
  });

  it('leaves another host recorded', () => {
    const other = {};
    const record = useRecord(other);
    releaseHostFocusRecord({});
    expect(record.onTextInputBlur).not.toHaveBeenCalled();
    expect(record.current()).toBe(other);
  });

  it('does nothing when the renderer has no dispatch-free blur', () => {
    const host = {};
    const record = useRecord(host, false);
    releaseHostFocusRecord(host);
    expect(record.current()).toBe(host);
  });
});
