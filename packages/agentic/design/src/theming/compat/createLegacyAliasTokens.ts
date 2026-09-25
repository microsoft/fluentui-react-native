import { memoize } from '@fluentui-react-native/framework-base';

import { getAliasTokens, getShadowTokens } from '../../tokens/legacy';
import type { AliasColorTokens } from '../types/Color.types';
import type { ThemeShadowDefinition } from '../types/Shadow.types';
import type { AppearanceOptions } from '../types/Theme.types';

function createLegacyColorAliasTokensWorker(mode: AppearanceOptions): AliasColorTokens {
  return getAliasTokens(mode);
}

export const createLegacyColorAliasTokens = memoize(createLegacyColorAliasTokensWorker);

function createLegacyShadowAliasTokensWorker(mode: AppearanceOptions): ThemeShadowDefinition {
  return getShadowTokens(mode);
}

export const createLegacyShadowAliasTokens = memoize(createLegacyShadowAliasTokensWorker);
