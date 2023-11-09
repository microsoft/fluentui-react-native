import { requireNativeComponent } from 'react-native';

import { ensureNativeComponent } from './ensureNativeComponent';

describe('ensureNativeComponent test suite', () => {
  beforeAll(() => {
    jest.mock('react-native/Libraries/ReactNative/requireNativeComponent', () => {
      return {
        default: jest.fn((className) => {
          if (className == 'RCTView') {
            return jest.requireActual('react-native/Libraries/Components/View/View');
          }

          return null;
        }),
      };
    });
  });

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

  afterAll(() => {
    jest.clearAllMocks();
  });
});
