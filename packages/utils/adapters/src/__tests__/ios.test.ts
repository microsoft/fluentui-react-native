import { filterViewProps, filterTextProps, filterImageProps } from '../adapters.ios';

describe('iOS filter tests', () => {
  test('filterTextProps works', () => {
    expect(filterTextProps('foo')).toBeFalsy();
    expect(filterTextProps('children')).toBeTruthy();
    expect(filterTextProps('style')).toBeTruthy();
    expect(filterTextProps('accessible')).toBeTruthy();
    expect(filterTextProps('selectable')).toBeFalsy();
  });

  test('filterViewProps works', () => {
    expect(filterViewProps('foo')).toBeFalsy();
    expect(filterViewProps('children')).toBeTruthy();
    expect(filterViewProps('style')).toBeTruthy();
    expect(filterViewProps('accessible')).toBeTruthy();
    expect(filterViewProps('animationClass')).toBeFalsy();
    expect(filterViewProps('shouldRasterizeIOS')).toBeTruthy();
    expect(filterViewProps('renderToHardwareTextureAndroid')).toBeFalsy();
  });

  test('filterImageProps works', () => {
    expect(filterImageProps('foo')).toBeFalsy();
    expect(filterImageProps('children')).toBeTruthy();
    expect(filterImageProps('style')).toBeTruthy();
    expect(filterImageProps('accessible')).toBeTruthy();
  });
});
