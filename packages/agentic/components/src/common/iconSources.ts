import type { FontIconSource } from '../primitives/icon/icon.types';

export const semanticIconSources = {
  checkmark: { codepoint: 0x2713 },
  chevron: { codepoint: 0x203a },
  dismiss: { codepoint: 0x2715 },
  error: { codepoint: 0x2716 },
  indeterminate: { codepoint: 0x2212 },
  person: { codepoint: 0x1f464 },
  search: { codepoint: 0x1f50d },
  selectedCircle: { codepoint: 0x25cf },
  unselectedCircle: { codepoint: 0x25cb },
} as const satisfies Record<string, FontIconSource>;
