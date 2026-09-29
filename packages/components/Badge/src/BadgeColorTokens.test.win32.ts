import { createColorPinningTheme, resolveV1ColorTokens } from '@fluentui-react-native/test-tools';

import { stylingSettings as badgeStylingSettings } from './Badge.styling';
import { stylingSettings as counterBadgeStylingSettings } from './CounterBadge/CounterBadge.styling';
import { stylingSettings as presenceBadgeStylingSettings } from './PresenceBadge/PresenceBadge.styling';

const theme = createColorPinningTheme();

it('pins Badge color tokens on Win32', () => {
  expect(resolveV1ColorTokens(badgeStylingSettings.tokens, theme)).toMatchSnapshot();
});

it('pins CounterBadge color tokens on Win32', () => {
  expect(resolveV1ColorTokens(counterBadgeStylingSettings.tokens, theme)).toMatchSnapshot();
});

it('pins PresenceBadge color tokens on Win32', () => {
  expect(resolveV1ColorTokens(presenceBadgeStylingSettings.tokens, theme)).toMatchSnapshot();
});
