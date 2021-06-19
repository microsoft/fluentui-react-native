import { filterViewProps, filterTextProps, filterImageProps } from '../adapters.win32';

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
});
