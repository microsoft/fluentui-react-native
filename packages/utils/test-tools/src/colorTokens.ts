import type { Theme } from '@fluentui-react-native/design/theming';
import { immutableMerge } from '@fluentui-react-native/framework-base';
import type { IComponentSettings } from '@uifabricshared/foundation-settings';
import { mergeBaseSettings } from '@uifabricshared/themed-settings';

type UnknownRecord = Record<string, unknown>;

export type ColorTokenSnapshot = UnknownRecord;

export type V0SettingsEntry<TSettings extends IComponentSettings = IComponentSettings> = TSettings | string | ((theme: Theme) => TSettings);

export type V1TokenSettings<TTokens extends object = UnknownRecord> = TTokens | string | ((theme: Theme) => TTokens);

const colorKeyPattern = /(?:color|background|foreground|fill|stroke|tint)$/i;

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (!isRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortValue(value[key])]),
  );
}

function resolveThemeColor(value: unknown, theme: Theme): unknown {
  const seen = new Set<string>();
  while (typeof value === 'string' && Object.hasOwn(theme.colors, value) && !seen.has(value)) {
    seen.add(value);
    value = theme.colors[value];
  }
  return sortValue(value);
}

function collectColorTokens(value: unknown, theme: Theme): unknown {
  if (Array.isArray(value)) {
    const entries = value.map((entry) => collectColorTokens(entry, theme)).filter((entry) => entry !== undefined);
    return entries.length > 0 ? entries : undefined;
  }
  if (!isRecord(value)) {
    return undefined;
  }

  const entries: [string, unknown][] = [];
  for (const key of Object.keys(value).sort()) {
    const child = colorKeyPattern.test(key) ? resolveThemeColor(value[key], theme) : collectColorTokens(value[key], theme);
    if (child !== undefined && (!isRecord(child) || Object.keys(child).length > 0)) {
      entries.push([key, child]);
    }
  }
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export function getColorTokenSnapshot(value: unknown, theme: Theme): ColorTokenSnapshot {
  return (collectColorTokens(value, theme) as ColorTokenSnapshot | undefined) ?? {};
}

export function resolveV0ColorTokens<TSettings extends IComponentSettings>(
  settings: V0SettingsEntry<TSettings>[],
  theme: Theme,
): ColorTokenSnapshot {
  const resolved = mergeBaseSettings(settings, theme, (currentTheme, name) => currentTheme.components?.[name] as TSettings | undefined);
  return getColorTokenSnapshot(resolved, theme);
}

export function resolveV1ColorTokens<TTokens extends object>(tokenSettings: V1TokenSettings<TTokens>[], theme: Theme): ColorTokenSnapshot {
  const resolved = immutableMerge<TTokens>(
    ...tokenSettings.map((entry) => {
      if (typeof entry === 'string') {
        return (theme.components?.[entry] as TTokens | undefined) ?? ({} as TTokens);
      }
      return typeof entry === 'function' ? entry(theme) : entry;
    }),
  );
  return getColorTokenSnapshot(resolved, theme);
}
