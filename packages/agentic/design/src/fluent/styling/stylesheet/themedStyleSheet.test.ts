import { themedStyleSheet } from './themedStyleSheet';

interface IFakeTheme {
  color1?: string;
  color2?: string;
  fontSize?: number;
}

function _createTheme1(): IFakeTheme {
  return {
    color1: 'blue',
    color2: 'red',
    fontSize: 10,
  };
}

function _createTheme2(): IFakeTheme {
  return {
    color1: 'green',
    color2: 'black',
    fontSize: 12,
  };
}

const getStyles1 = themedStyleSheet((t: IFakeTheme) => {
  return {
    style1: {
      backgroundColor: t.color1,
      color: t.color2,
      fontSize: t.fontSize,
    },
    style2: {
      color: t.color1,
      backgroundColor: 'purple',
      fontSize: 50,
    },
  };
});

const getThemeOptionalStyles = themedStyleSheet((t: IFakeTheme) => {
  return {
    style3: {
      backgroundColor: (t && t.color1) || 'white',
      color: (t && t.color2) || 'black',
      fontSize: (t && t.fontSize) || 8,
    },
  };
});

describe('Themed style sheet tests', () => {
  test('get no theme stylesheet', () => {
    const styles = getThemeOptionalStyles(undefined);
    expect(styles.style3).toEqual({
      backgroundColor: 'white',
      color: 'black',
      fontSize: 8,
    });
  });

  test('get no theme stylesheet caches', () => {
    const styles1 = getThemeOptionalStyles(undefined);
    const styles2 = getThemeOptionalStyles(undefined);
    expect(styles1).toBe(styles2);
  });

  test('get conditional stylesheet works with theme', () => {
    const theme = _createTheme1();
    const styles = getThemeOptionalStyles(theme);
    expect(styles.style3).toEqual({
      backgroundColor: 'blue',
      color: 'red',
      fontSize: 10,
    });
  });

  test('get themed stylesheet works for multiples', () => {
    const theme = _createTheme1();
    const styles = getStyles1(theme);
    expect(styles.style1).toEqual({
      backgroundColor: 'blue',
      color: 'red',
      fontSize: 10,
    });
    expect(styles.style2).toEqual({
      color: 'blue',
      backgroundColor: 'purple',
      fontSize: 50,
    });
  });

  test('get themed stylesheet caches correctly', () => {
    const theme1 = _createTheme1();
    const theme2 = _createTheme2();
    const stylest1a = getStyles1(theme1);
    const stylest2a = getStyles1(theme2);
    const stylest1b = getStyles1(theme1);
    const stylest2b = getStyles1(theme2);
    expect(stylest1a).toBe(stylest1b);
    expect(stylest2a).toBe(stylest2b);
    expect(stylest1a).not.toBe(stylest2a);
  });
});
