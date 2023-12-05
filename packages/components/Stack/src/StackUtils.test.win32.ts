import type { Theme } from '@fluentui-react-native/framework';

import { parseGap, parsePadding } from './StackUtils';

describe('StackUtils', () => {
  describe('parseGap', () => {
    const theme = {
      spacing: { m: '16em' },
    } as unknown as Theme;

    it('returns a default value when given undefined', () => {
      expect(parseGap(undefined, theme)).toEqual({ rowGap: { value: 0, unit: 'px' }, columnGap: { value: 0, unit: 'px' } });
    });

    it('returns a value with px when given a number', () => {
      expect(parseGap(10, theme)).toEqual({ rowGap: { value: 10, unit: 'px' }, columnGap: { value: 10, unit: 'px' } });
    });

    it('can parse a string with px', () => {
      expect(parseGap('32px', theme)).toEqual({ rowGap: { value: 32, unit: 'px' }, columnGap: { value: 32, unit: 'px' } });
    });

    it('can parse a string with a float', () => {
      expect(parseGap('20.5px', theme)).toEqual({ rowGap: { value: 20.5, unit: 'px' }, columnGap: { value: 20.5, unit: 'px' } });
    });

    it('parses the value from the theme when given a spacing key', () => {
      expect(parseGap('m', theme)).toEqual({ rowGap: { value: 16, unit: 'em' }, columnGap: { value: 16, unit: 'em' } });
    });

    it('can parse a string with both horizontal and vertical gap', () => {
      expect(parseGap('30px 10px', theme)).toEqual({ rowGap: { value: 30, unit: 'px' }, columnGap: { value: 10, unit: 'px' } });
    });

    it('defaults to px with a string with horizontal and vertical gap with no units', () => {
      expect(parseGap('50 30', theme)).toEqual({ rowGap: { value: 50, unit: 'px' }, columnGap: { value: 30, unit: 'px' } });
    });

    it('can parse a string with horizontal and vertical gap with one of them getting value from the theme when given a spacing key', () => {
      expect(parseGap('50px m', theme)).toEqual({ rowGap: { value: 50, unit: 'px' }, columnGap: { value: 16, unit: 'em' } });
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

    it('returns its argument when given undefined, a number, or an empty string', () => {
      expect(parsePadding(undefined, theme)).toEqual(undefined);
      expect(parsePadding(0, theme)).toEqual(0);
    });

    it('returns its argument when given a CSS-style padding', () => {
      expect(parsePadding('10px', theme)).toEqual('10px');
    });

    it('converts themed spacing keys to CSS-style paddings', () => {
      expect(parsePadding('s2', theme)).toEqual('5px');
    });
  });
});
