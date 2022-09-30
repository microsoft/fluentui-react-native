import { requireNativeComponent, View } from 'react-native';
import { ensureNativeComponent } from './ensureNativeComponent';

jest.mock('react-native/Libraries/ReactNative/requireNativeComponent', () => (className) => {
  if (className == 'RCTView') {
    return jest.requireActual('View');
  }

  return null;
});

describe('ensureNativeComponent test suite', () => {
  it('Base component render', () => {
    const component = ensureNativeComponent('RCTView');
    expect(requireNativeComponent).toHaveBeenCalled();
    expect(component).toEqual(View);
  });

  it('Base component render', () => {
    const component = ensureNativeComponent('RCTView');
    const component2 = ensureNativeComponent('RCTView');
    expect(requireNativeComponent).not.toHaveBeenCalled();
    expect(component).toEqual(component2);
  });

  it('Base component render', () => {
    ensureNativeComponent('RCTView');
    expect(requireNativeComponent).toHaveBeenCalled();
    ensureNativeComponent('RCTText');
    expect(requireNativeComponent).toHaveBeenCalled();
  });
});
