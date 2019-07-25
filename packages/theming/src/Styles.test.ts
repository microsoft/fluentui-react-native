import { StyleProp } from 'react-native';
import { ITheme } from './Theme.types';
import { IPalette } from './Color.types';
import { ITypography } from './Typography.types';
import { flattenStyle, mergeAndFinalizeStyles, finalizeColor, finalizeFontFamily } from './Styles';
import { IStyleValueFinalizers } from './Styles.types';

const theme: ITheme = {
  palette: {
    bodyBackground: '#ff0000',
    bodyText: '#000000'
  } as IPalette,
  typography: {
    families: {
      primary: 'Arial'
    },
    sizes: {
      medium: 14
    },
    weights: {
      medium: '500'
    }
  } as ITypography,
  settings: {}
};

const finalizers: IStyleValueFinalizers = {
  backgroundColor: finalizeColor,
  color: finalizeColor,
  fontFamily: finalizeFontFamily
};

interface IFakeStyle {
  backgroundColor?: string;
  color?: string;
  fontFamily?: string;
  borderWidth?: number;
}

type IFakeStyleProp = StyleProp<IFakeStyle>;

const s1: IFakeStyleProp = [
  { backgroundColor: 'blue' },
  [{ color: 'red', borderWidth: 1 }, { fontFamily: 'segoe' }, [{ backgroundColor: 'bodyBackground' }]]
];

const s1flatten: IFakeStyleProp = {
  backgroundColor: 'bodyBackground',
  color: 'red',
  borderWidth: 1,
  fontFamily: 'segoe'
};

const s1flattenFinal: IFakeStyleProp = {
  backgroundColor: theme.palette.bodyBackground,
  color: 'red',
  borderWidth: 1,
  fontFamily: 'segoe'
};

const s2: IFakeStyleProp = {
  borderWidth: 2,
  fontFamily: 'primary',
  color: 'bodyText'
};

const s2Final: IFakeStyleProp = {
  borderWidth: 2,
  fontFamily: theme.typography.families.primary,
  color: theme.palette.bodyText
};

const sMerged: IFakeStyleProp = {
  backgroundColor: 'bodyBackground',
  borderWidth: 2,
  fontFamily: 'primary',
  color: 'bodyText'
};

const sMergedFinal: IFakeStyleProp = {
  ...s1flattenFinal,
  ...s2Final
};

describe('Style flatten and merge tests', () => {
  test('flatten recursive arrays', () => {
    const flattened = flattenStyle(s1);
    expect(flattened).toEqual(s1flatten);
    expect(flattened).not.toBe(s1);
  });

  test('flatten flat style returns style', () => {
    const flattened = flattenStyle(s2);
    expect(flattened).toBe(s2);
  });

  test('merge also flattens', () => {
    const merged = mergeAndFinalizeStyles(undefined, undefined, s1, s2);
    expect(merged).toEqual(sMerged);
  });

  test('finalize single style', () => {
    const final = mergeAndFinalizeStyles(theme, finalizers, s1);
    expect(final).toEqual(s1flattenFinal);

    const final2 = mergeAndFinalizeStyles(theme, finalizers, s2);
    expect(final2).toEqual(s2Final);
  });

  test('merge and finalize style', () => {
    const mergedAndFinal = mergeAndFinalizeStyles(theme, finalizers, s1, s2);
    expect(mergedAndFinal).toEqual(sMergedFinal);
  });
});
