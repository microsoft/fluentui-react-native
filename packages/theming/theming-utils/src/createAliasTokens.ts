import { getAliasTokens } from '@fluentui-react-native/theme-tokens';
import { AliasColorTokens, AppearanceOptions } from '@fluentui-react-native/theme-types';
import { memoize } from '@fluentui-react-native/memo-cache';

function createAliasTokensWorker(mode: AppearanceOptions): AliasColorTokens {
  const aliasTokens = getAliasTokens(mode);
  return {
    neutralForeground1: aliasTokens.neutralForeground1.fillColorRest,
    neutralForeground2: aliasTokens.neutralForeground2.fillColorRest,
    neutralForeground2Hover: aliasTokens.neutralForeground2.fillColorHover,
    neutralForeground2Pressed: aliasTokens.neutralForeground2.fillColorPressed,
    neutralForeground2Brand: aliasTokens.neutralForeground2Brand.fillColorRest,
    neutralForeground2BrandHover: aliasTokens.neutralForeground2Brand.fillColorHover,
    neutralForeground2BrandPressed: aliasTokens.neutralForeground2Brand.fillColorPressed,
    neutralForeground3: aliasTokens.neutralForeground3.fillColorRest,
    neutralForeground3Hover: aliasTokens.neutralForeground3.fillColorHover,
    neutralForeground3Pressed: aliasTokens.neutralForeground3.fillColorPressed,
    neutralForeground3Brand: aliasTokens.neutralForeground3Brand.fillColorRest,
    neutralForeground3BrandHover: aliasTokens.neutralForeground3Brand.fillColorHover,
    neutralForeground3BrandPressed: aliasTokens.neutralForeground3Brand.fillColorPressed,
    neutralForeground4: aliasTokens.neutralForeground4.fillColorRest,
    neutralForegroundDisabled: aliasTokens.neutralForeground1.fillColorDisabled,

    brandForegroundLink: aliasTokens.brandForegroundLink.fillColorRest,
    brandForegroundLinkHover: aliasTokens.brandForegroundLink.fillColorHover,
    brandForegroundLinkPressed: aliasTokens.brandForegroundLink.fillColorPressed,
    compoundBrandForeground1: aliasTokens.compoundBrandForeground1.fillColorRest,
    compoundBrandForeground1Hover: aliasTokens.compoundBrandForeground1.fillColorHover,
    compoundBrandForeground1Pressed: aliasTokens.compoundBrandForeground1.fillColorPressed,
    brandForeground1: aliasTokens.brandForeground1.fillColorRest,
    brandForeground2: aliasTokens.brandForeground2.fillColorRest,

    neutralForegroundInverted: aliasTokens.neutralForegroundInverted.fillColorRest,
    neutralForegroundOnBrand: aliasTokens.neutralForegroundOnBrand.fillColorRest,
    neutralForegroundInvertedLink: aliasTokens.neutralForegroundInvertedLink.fillColorRest,
    neutralForegroundInvertedLinkHover: aliasTokens.neutralForegroundInvertedLink.fillColorHover,
    neutralForegroundInvertedLinkPressed: aliasTokens.neutralForegroundInvertedLink.fillColorPressed,

    neutralBackground1: aliasTokens.neutralBackground1.fillColorRest,
    neutralBackground1Hover: aliasTokens.neutralBackground1.fillColorHover,
    neutralBackground1Pressed: aliasTokens.neutralBackground1.fillColorPressed,
    neutralBackground2: aliasTokens.neutralBackground2.fillColorRest,
    neutralBackground2Hover: aliasTokens.neutralBackground2.fillColorHover,
    neutralBackground2Pressed: aliasTokens.neutralBackground2.fillColorPressed,
    neutralBackground3: aliasTokens.neutralBackground3.fillColorRest,
    neutralBackground3Hover: aliasTokens.neutralBackground3.fillColorHover,
    neutralBackground3Pressed: aliasTokens.neutralBackground3.fillColorPressed,
    neutralBackground4: aliasTokens.neutralBackground4.fillColorRest,
    neutralBackground4Hover: aliasTokens.neutralBackground4.fillColorHover,
    neutralBackground4Pressed: aliasTokens.neutralBackground4.fillColorPressed,
    neutralBackground5: aliasTokens.neutralBackground5.fillColorRest,
    neutralBackground5Hover: aliasTokens.neutralBackground5.fillColorHover,
    neutralBackground5Pressed: aliasTokens.neutralBackground5.fillColorPressed,
    neutralBackground6: aliasTokens.neutralBackground6.fillColorRest,
    neutralBackgroundInverted: aliasTokens.neutralBackgroundInverted.fillColorRest,

    subtleBackground: aliasTokens.subtleBackground.fillColorRest,
    subtleBackgroundHover: aliasTokens.subtleBackground.fillColorHover,
    subtleBackgroundPressed: aliasTokens.subtleBackground.fillColorPressed,

    transparentBackground: aliasTokens.transparentBackground.fillColorRest,
    transparentBackgroundHover: aliasTokens.transparentBackground.fillColorHover,
    transparentBackgroundPressed: aliasTokens.transparentBackground.fillColorPressed,

    neutralBackgroundDisabled: aliasTokens.neutralBackground1.fillColorRest,

    brandBackground: aliasTokens.brandBackground.fillColorRest,
    brandBackgroundHover: aliasTokens.brandBackground.fillColorHover,
    brandBackgroundPressed: aliasTokens.brandBackground.fillColorPressed,
    compoundBrandBackground1: aliasTokens.compoundBrandBackground1.fillColorRest,
    compoundBrandBackground1Hover: aliasTokens.compoundBrandBackground1.fillColorHover,
    compoundBrandBackground1Pressed: aliasTokens.compoundBrandBackground1.fillColorPressed,

    neutralStrokeAccessible: aliasTokens.neutralStrokeAccessible.strokeColorRest,
    neutralStrokeAccessibleHover: aliasTokens.neutralStrokeAccessible.strokeColorHover,
    neutralStrokeAccessiblePressed: aliasTokens.neutralStrokeAccessible.strokeColorPressed,
    neutralStroke1: aliasTokens.neutralStroke1.strokeColorRest,
    neutralStroke1Hover: aliasTokens.neutralStroke1.strokeColorHover,
    neutralStroke1Pressed: aliasTokens.neutralStroke1.strokeColorPressed,
    neutralStroke2: aliasTokens.neutralStroke2.strokeColorRest,
    neutralStroke3: aliasTokens.neutralStroke3.strokeColorRest,
    brandStroke1: aliasTokens.brandStroke1.strokeColorRest,
    brandStroke2: aliasTokens.brandStroke2.strokeColorRest,
    compoundBrandStroke1: aliasTokens.compoundBrandStroke1.strokeColorRest,
    compoundBrandStroke1Hover: aliasTokens.compoundBrandStroke1.strokeColorHover,
    compoundBrandStroke1Pressed: aliasTokens.compoundBrandStroke1.strokeColorPressed,
    neutralStrokeDisabled: aliasTokens.neutralStroke1.strokeColorDisabled,

    transparentStroke: aliasTokens.transparentStroke.strokeColorRest,
    transparentStrokeInteractive: aliasTokens.transparentStroke.strokeColorHover,
    transparentStrokeDisabled: aliasTokens.transparentStroke.strokeColorDisabled,
  };
}

export const createAliasTokens = memoize(createAliasTokensWorker);
