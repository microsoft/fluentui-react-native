import { getLegacyTokenSet } from './generatedTokenSet';

const light = { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' } as const;
const dark = { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'base' } as const;
const elevatedDark = { ...dark, interfaceLevel: 'elevated' } as const;

it('lazily caches stable legacy token sets by appearance', () => {
  const lightTokens = getLegacyTokenSet(light);

  expect(getLegacyTokenSet(light)).toBe(lightTokens);
  const darkTokens = getLegacyTokenSet(dark);
  expect(darkTokens).not.toBe(lightTokens);
  expect(getLegacyTokenSet(elevatedDark)).toBe(darkTokens);
  expect(lightTokens.aliases).toBeDefined();
  expect(lightTokens.shadows).toBeDefined();
});
