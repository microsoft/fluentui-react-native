export type GeneratedAliasTokenValue = number | string;
export type GeneratedAliasTokenGroup = Readonly<Record<string, GeneratedAliasTokenValue>>;
export type GeneratedAliasTokens = Readonly<Record<string, GeneratedAliasTokenGroup>>;

export type GeneratedShadowLayer = Readonly<{
  blur: number;
  color: string;
  x: number;
  y: number;
}>;

export type GeneratedShadowTokens = Readonly<Record<string, readonly GeneratedShadowLayer[]>>;

export type GeneratedLegacyTokenSet = Readonly<{
  aliases: GeneratedAliasTokens;
  shadows: GeneratedShadowTokens;
}>;
