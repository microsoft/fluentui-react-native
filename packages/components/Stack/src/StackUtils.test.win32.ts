import type { Theme } from '@fluentui-react-native/framework';

import { parseGap, parsePadding } from './StackUtils';

describe('StackUtils', () => {
  describe('parseGap', () => {
    const theme = {
      spacing: { m: '16em' },
    } as unknown as Theme;

    it('returns a default value when given undefined', () => {
      expect(parseGap(undefined, theme)).toEqual({ rowGap: 0, columnGap: 0 });
    });

    it('uses a number for both gaps', () => {
      expect(parseGap(10, theme)).toEqual({ rowGap: 10, columnGap: 10 });
    });

    it('parses a pixel string as a number', () => {
      expect(parseGap('32px', theme)).toEqual({ rowGap: 32, columnGap: 32 });
    });

    it('parses a pixel string with a float', () => {
      expect(parseGap('20.5px', theme)).toEqual({ rowGap: 20.5, columnGap: 20.5 });
    });

    it('parses the value from the theme when given a spacing key', () => {
      expect(parseGap('m', theme)).toEqual({ rowGap: 16, columnGap: 16 });
    });

    it('parses separate row and column gaps', () => {
      expect(parseGap('30px 10px', theme)).toEqual({ rowGap: 30, columnGap: 10 });
    });

    it('parses separate row and column gaps without units', () => {
      expect(parseGap('50 30', theme)).toEqual({ rowGap: 50, columnGap: 30 });
    });

    it('resolves a spacing key in separate row and column gaps', () => {
      expect(parseGap('50px m', theme)).toEqual({ rowGap: 50, columnGap: 16 });
    });
  });

  describe('parsePadding', () => {
    const theme = {
      spacing: {
        s2: '5px',
        s1: '10px',
        m: '15px',
        l1: '20px',
        l2: '25px',
      },
    } as unknown as Theme;

    it('returns its argument when given undefined or a number', () => {
      expect(parsePadding(undefined, theme)).toEqual(undefined);
      expect(parsePadding(0, theme)).toEqual(0);
    });

    it('parses a pixel string as a number', () => {
      expect(parsePadding('10px', theme)).toEqual(10);
    });

    it('resolves a themed spacing key as a number', () => {
      expect(parsePadding('s2', theme)).toEqual(5);
    });
  });
});
