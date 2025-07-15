import { getMemoCache } from '@fluentui-react-native/framework-base';

import type { IButtonSettings } from './MockButton';
import { MockButton } from './MockButton';
import { theme } from './MockTheme';

const b1: IButtonSettings = {
  tokens: {
    fontSize: 'large',
    fontWeight: 900,
    color: 'buttonText',
    backgroundColor: 'buttonBackground',
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#c1c1c1',
    captionColor: 'blue',
  },
};

const b1resolved: IButtonSettings = {
  root: {
    style: {
      borderColor: '#c1c1c1',
      borderWidth: 1,
      borderRadius: 2,
      backgroundColor: 'blue',
    },
  },
  content: {
    fontSize: 'large',
    fontWeight: 900,
    color: 'buttonText',
  },
  subContent: {
    style: {
      fontSize: 14,
      fontWeight: 900,
      color: 'blue',
    },
  },
  icon: {
    style: {
      color: 'yellow',
    },
  },
};

const b1resolvedRecurse: IButtonSettings = {
  root: {
    style: {
      borderColor: '#c1c1c1',
      borderWidth: 1,
      borderRadius: 2,
      backgroundColor: 'blue',
    },
  },
  content: {
    // note that these three values will get cleared by the content element, but remerged by the base class, this
    // is an issue with the test component implementation, not of the framework
    fontSize: 'large',
    fontWeight: 900,
    color: 'buttonText',
    style: {
      fontSize: 14,
      fontWeight: 900,
      color: 'yellow',
    },
  },
  subContent: {
    style: {
      fontSize: 14,
      fontWeight: 900,
      color: 'blue',
    },
  },
  icon: {
    style: {
      color: 'yellow',
    },
  },
};

describe('Token settings unit tests', () => {
  test('resolve base settings', () => {
    const cache = getMemoCache();
    const resolved = MockButton({}, b1, theme, cache, false);
    expect(resolved).toEqual(b1resolved);
  });

  test('resolve base with recursion', () => {
    const cache = getMemoCache();
    const resolved = MockButton({}, b1, theme, cache, true);
    expect(resolved).toEqual(b1resolvedRecurse);
  });

  test('two default buttons return same object', () => {
    const cache = getMemoCache();
    const resolved1 = MockButton({ content: 'button1' }, b1, theme, cache, false);
    const resolved2 = MockButton({ content: 'button2' }, b1, theme, cache, false);
    expect(resolved1).toEqual(resolved2);
    Object.getOwnPropertyNames(resolved1).forEach((key) => {
      expect(resolved1[key]).toBe(resolved2[key]);
    });
  });

  test('setting props that match defaults keep same object', () => {
    const cache = getMemoCache();
    const resolved1 = MockButton({ content: 'button1' }, b1, theme, cache, false);
    const resolved2 = MockButton({ content: 'button2', color: 'buttonText' }, b1, theme, cache, false);
    expect(resolved1).toEqual(resolved2);
    Object.getOwnPropertyNames(resolved1).forEach((key) => {
      expect(resolved1[key]).toBe(resolved2[key]);
    });
  });

  test('prop token overrides produce partial new object', () => {
    const cache = getMemoCache();
    const resolved1 = MockButton({ content: 'button1' }, b1, theme, cache, false);
    const resolved2 = MockButton({ content: 'button2', color: 'purple' }, b1, theme, cache, false);
    expect(resolved1).not.toBe(resolved2);
    expect(resolved1['root']).toBe(resolved2['root']);
    expect(resolved1.content).not.toBe(resolved2.content);
  });

  test('prop token overrides, multiple values are memoized', () => {
    const cache = getMemoCache();
    const resolved1 = MockButton({ content: 'button1', borderRadius: 3, color: 'purple' }, b1, theme, cache, false);
    const resolved2 = MockButton({ content: 'button2', color: 'purple', borderRadius: 3 }, b1, theme, cache, false);
    expect(resolved1).toEqual(resolved2);
    Object.getOwnPropertyNames(resolved1).forEach((key) => {
      expect(resolved1[key]).toBe(resolved2[key]);
    });
  });

  test('prop token overrides, different keys same value produce different objects', () => {
    const cache = getMemoCache();
    const resolved1 = MockButton({ content: 'button1', backgroundColor: 'purple' }, b1, theme, cache, false);
    const resolved2 = MockButton({ content: 'button2', color: 'purple' }, b1, theme, cache, false);
    expect(resolved1).not.toBe(resolved2);
    expect(resolved1['root']).not.toBe(resolved2['root']);
    expect(resolved1.content).not.toBe(resolved2.content);
  });
});
