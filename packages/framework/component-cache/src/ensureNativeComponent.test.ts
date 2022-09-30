import { ensureNativeComponent } from './ensureNativeComponent';

jest.mock('react-native/Libraries/ReactNative/requireNativeComponent', () =>
  jest.fn((className) => {
    if (className == 'RCTView') {
      return jest.requireActual('react-native/Libraries/Components/View/View');
    }

    return null;
  }),
);
const requireNativeComponent = require('react-native/Libraries/ReactNative/requireNativeComponent');

describe('ensureNativeComponent test suite', () => {
  it('Base component render', () => {
    ensureNativeComponent('RCTView');
    expect(requireNativeComponent).toHaveBeenCalled();
  });

  it('Base component render', () => {
    const component = ensureNativeComponent('RCTView');
    const component2 = ensureNativeComponent('RCTView');

    // Make sure requireNativeComponent has only been called once
    expect(requireNativeComponent).toHaveBeenCalledTimes(1);
    expect(component).toEqual(component2);
  });

  it('Base component render', () => {
    ensureNativeComponent('RCTView');
    expect(requireNativeComponent).toHaveBeenCalled();
    ensureNativeComponent('RCTText');
    expect(requireNativeComponent).toHaveBeenCalled();
  });
});

jest.clearAllMocks();
