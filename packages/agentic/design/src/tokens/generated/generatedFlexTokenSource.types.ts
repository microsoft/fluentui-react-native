import type { FlexTokens, InteractiveColorOverrides, SemanticColorTokenValues } from '../flex.types';

export type GeneratedFlexTokenSource = Omit<FlexTokens, 'color'> & {
  color: Omit<SemanticColorTokenValues, 'hover' | 'pressed'> & {
    hover: Partial<InteractiveColorOverrides>;
    pressed: Partial<InteractiveColorOverrides>;
  };
};
