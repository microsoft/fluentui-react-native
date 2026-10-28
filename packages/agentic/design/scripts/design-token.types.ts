export type ShadowLayer = {
  color: string;
  x: number;
  y: number;
  blur: number;
};

export type ShadowDefinition = [ShadowLayer, ShadowLayer];

export type ShadowTokens = {
  shadow16: ShadowDefinition;
  shadow2: ShadowDefinition;
  shadow28: ShadowDefinition;
  shadow4: ShadowDefinition;
  shadow64: ShadowDefinition;
  shadow8: ShadowDefinition;
  shadowBrand16: ShadowDefinition;
  shadowBrand2: ShadowDefinition;
  shadowBrand28: ShadowDefinition;
  shadowBrand4: ShadowDefinition;
  shadowBrand64: ShadowDefinition;
  shadowBrand8: ShadowDefinition;
};
