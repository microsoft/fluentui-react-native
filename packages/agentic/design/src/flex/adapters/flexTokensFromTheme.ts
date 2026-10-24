import { immutableMerge } from '@fluentui-react-native/framework-base';
import type { ColorValue } from 'react-native';

import type { Theme } from '../../fluent/types/Theme.types';
import { defaultResolvedThemeAppearance } from '../../theming/appearance';
import { mapObjectFromObject } from '../../utilities/objects';
import { normalizeFlexColor, resolveExplicitFlexColor } from '../colors/flexColor';
import type { ColorSchemeSelector } from '../colors/flexColor';
import { createInteractiveColor } from '../colors/interactiveColor';
import { defaultFlexTokens, nonFluentFlexTokens } from '../defaults/defaultTokens';
import type { FlexColorInput, FlexTokens, InteractiveColor, SemanticColors } from '../tokens.types';
import flexFromTheme from '../../tokens/mappings/flex-from-theme.json' with { type: 'json' };

type MappedColor = { rest: ColorValue; hover?: ColorValue; pressed?: ColorValue };
type MappedFlexTokens = Omit<Partial<FlexTokens>, 'color'> & { color?: Record<string, MappedColor> };

const defaultMappedFlexTokens = mapObjectFromObject<MappedFlexTokens>(
  defaultFlexTokens,
  Object.fromEntries(Object.keys(flexFromTheme).map((destinationPath) => [destinationPath, destinationPath])),
);

const { color: nonFluentColors, ...nonFluentGroups } = nonFluentFlexTokens;
const nonFluentColorDescriptions = Object.entries(nonFluentColors as Record<string, FlexColorInput>).map(
  ([name, value]) => [name, normalizeFlexColor(value, 'standard', `color.${name}`)] as const,
);

/**
 * Build Flex tokens from the values exposed by a FURN Theme. Interaction
 * states the Theme does not map equal rest; no interaction algorithm runs.
 * The scheme selects light/dark tuples in values without a Theme source.
 */
export function flexTokensFromTheme(theme: Theme, appearance: ColorSchemeSelector = defaultResolvedThemeAppearance): FlexTokens {
  const { color: mappedColors = {}, ...mappedGroups } = immutableMerge(
    defaultMappedFlexTokens,
    mapObjectFromObject<MappedFlexTokens>(theme, flexFromTheme),
  ) as MappedFlexTokens;

  const color: Record<string, InteractiveColor> = {};
  for (const [name, description] of nonFluentColorDescriptions) {
    color[name] = resolveExplicitFlexColor(description, appearance);
  }
  for (const [name, { rest, hover, pressed }] of Object.entries(mappedColors)) {
    color[name] = createInteractiveColor(rest, hover ?? rest, pressed ?? rest);
  }

  return Object.freeze({
    color: Object.freeze(color) as SemanticColors,
    ...immutableMerge(nonFluentGroups as object, mappedGroups as object),
  }) as FlexTokens;
}
