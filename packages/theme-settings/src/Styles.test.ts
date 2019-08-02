import { flattenStyle, mergeAndFinalizeStyles } from './Styles';
import { IFinalizeStyle, IStyleProp } from './Styles.types';

const theme = {
  palette: {
    bodyBackground: '#ff0000',
    bodyText: '#000000'
  },
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
  }
};

interface IFakeStyle {
  backgroundColor?: string;
  color?: string;
  fontFamily?: string;
  borderWidth?: number;
}

const styleFinalizer: IFinalizeStyle = (target: IFakeStyle) => {
  const newStyle: IFakeStyle = {};
  if (target.backgroundColor) {
    const newVal = theme.palette[target.backgroundColor];
    if (newVal) {
      newStyle.backgroundColor = newVal;
    }
  }

  if (target.color) {
    const newVal = theme.palette[target.color];
    if (newVal) {
      newStyle.color = newVal;
    }
  }

  if (target.fontFamily) {
    const newVal = theme.typography.families[target.fontFamily];
    if (newVal) {
      newStyle.fontFamily = newVal;
    }
  }
  return newStyle;
};

type IFakeStyleProp = IStyleProp<IFakeStyle>;

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
    const final = mergeAndFinalizeStyles(styleFinalizer, s1);
    expect(final).toEqual(s1flattenFinal);

    const final2 = mergeAndFinalizeStyles(styleFinalizer, s2);
    expect(final2).toEqual(s2Final);
  });

  test('merge and finalize style', () => {
    const mergedAndFinal = mergeAndFinalizeStyles(styleFinalizer, s1, s2);
    expect(mergedAndFinal).toEqual(sMergedFinal);
  });
});
