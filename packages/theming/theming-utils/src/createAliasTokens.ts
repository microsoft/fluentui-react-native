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
    neutralForeground2Selected: aliasTokens.neutralForeground2.fillColorSelected,
    neutralForeground2BrandHover: aliasTokens.neutralForeground2.fillColorBrandHover,
    neutralForeground2BrandPressed: aliasTokens.neutralForeground2.fillColorBrandPressed,
    neutralForeground2BrandSelected: aliasTokens.neutralForeground2.fillColorBrandSelected,
    neutralForeground3: aliasTokens.neutralForeground3.fillColorRest,
    neutralForeground3Hover: aliasTokens.neutralForeground3.fillColorHover,
    neutralForeground3Pressed: aliasTokens.neutralForeground3.fillColorPressed,
    neutralForeground3Selected: aliasTokens.neutralForeground3.fillColorSelected,
    neutralForeground3BrandHover: aliasTokens.neutralForeground3.fillColorBrandHover,
    neutralForeground3BrandPressed: aliasTokens.neutralForeground3.fillColorBrandPressed,
    neutralForeground3BrandSelected: aliasTokens.neutralForeground3.fillColorBrandSelected,
    neutralForeground4: aliasTokens.neutralForeground4.fillColorRest,
    neutralForegroundDisabled: aliasTokens.neutralForegroundDisabled.fillColorRest,

    brandForegroundLink: aliasTokens.brandForegroundLink.fillColorRest,
    brandForegroundLinkHover: aliasTokens.brandForegroundLink.fillColorHover,
    brandForegroundLinkPressed: aliasTokens.brandForegroundLink.fillColorPressed,
    brandForegroundLinkSelected: aliasTokens.brandForegroundLink.fillColorSelected,
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
    neutralForegroundInvertedLinkSelected: aliasTokens.neutralForegroundInvertedLink.fillColorSelected,

    neutralBackground1: aliasTokens.neutralBackground1.fillColorRest,
    neutralBackground1Hover: aliasTokens.neutralBackground1.fillColorHover,
    neutralBackground1Pressed: aliasTokens.neutralBackground1.fillColorPressed,
    neutralBackground1Selected: aliasTokens.neutralBackground1.fillColorSelected,
    neutralBackground2: aliasTokens.neutralBackground2.fillColorRest,
    neutralBackground2Hover: aliasTokens.neutralBackground2.fillColorHover,
    neutralBackground2Pressed: aliasTokens.neutralBackground2.fillColorPressed,
    neutralBackground2Selected: aliasTokens.neutralBackground2.fillColorSelected,
    neutralBackground3: aliasTokens.neutralBackground3.fillColorRest,
    neutralBackground3Hover: aliasTokens.neutralBackground3.fillColorHover,
    neutralBackground3Pressed: aliasTokens.neutralBackground3.fillColorPressed,
    neutralBackground3Selected: aliasTokens.neutralBackground3.fillColorSelected,
    neutralBackground4: aliasTokens.neutralBackground4.fillColorRest,
    neutralBackground4Hover: aliasTokens.neutralBackground4.fillColorHover,
    neutralBackground4Pressed: aliasTokens.neutralBackground4.fillColorPressed,
    neutralBackground4Selected: aliasTokens.neutralBackground4.fillColorSelected,
    neutralBackground5: aliasTokens.neutralBackground5.fillColorRest,
    neutralBackground5Hover: aliasTokens.neutralBackground5.fillColorHover,
    neutralBackground5Pressed: aliasTokens.neutralBackground5.fillColorPressed,
    neutralBackground5Selected: aliasTokens.neutralBackground5.fillColorSelected,
    neutralBackground6: aliasTokens.neutralBackground6.fillColorRest,
    neutralBackgroundInverted: aliasTokens.neutralBackgroundInverted.fillColorRest,

    subtleBackground: aliasTokens.subtleBackground.fillColorRest,
    subtleBackgroundHover: aliasTokens.subtleBackground.fillColorHover,
    subtleBackgroundPressed: aliasTokens.subtleBackground.fillColorPressed,
    subtleBackgroundSelected: aliasTokens.subtleBackground.fillColorSelected,

    transparentBackground: aliasTokens.transparentBackground.fillColorRest,
    transparentBackgroundHover: aliasTokens.transparentBackground.fillColorHover,
    transparentBackgroundPressed: aliasTokens.transparentBackground.fillColorPressed,
    transparentBackgroundSelected: aliasTokens.transparentBackground.fillColorSelected,

    neutralBackgroundDisabled: aliasTokens.neutralBackgroundDisabled.fillColorRest,

    neutralStencil1: aliasTokens.neutralStencil1.fillColorRest,
    neutralStencil2: aliasTokens.neutralStencil2.fillColorRest,

    brandBackground: aliasTokens.brandBackground.fillColorRest,
    brandBackgroundHover: aliasTokens.brandBackground.fillColorHover,
    brandBackgroundPressed: aliasTokens.brandBackground.fillColorPressed,
    brandBackgroundSelected: aliasTokens.brandBackground.fillColorSelected,
    compoundBrandBackground1: aliasTokens.compoundBrandBackground1.fillColorRest,
    compoundBrandBackground1Hover: aliasTokens.compoundBrandBackground1.fillColorHover,
    compoundBrandBackground1Pressed: aliasTokens.compoundBrandBackground1.fillColorPressed,

    brandBackgroundStatic: aliasTokens.brandBackgroundStatic.fillColorRest,
    brandBackground2: aliasTokens.brandBackground2.fillColorRest,

    neutralStrokeAccessible: aliasTokens.neutralStrokeAccessible.strokeColorRest,
    neutralStrokeAccessibleHover: aliasTokens.neutralStrokeAccessible.strokeColorHover,
    neutralStrokeAccessiblePressed: aliasTokens.neutralStrokeAccessible.strokeColorPressed,
    neutralStrokeAccessibleSelected: aliasTokens.neutralStrokeAccessible.strokeColorSelected,
    neutralStroke1: aliasTokens.neutralStroke1.strokeColorRest,
    neutralStroke1Hover: aliasTokens.neutralStroke1.strokeColorHover,
    neutralStroke1Pressed: aliasTokens.neutralStroke1.strokeColorPressed,
    neutralStroke1Selected: aliasTokens.neutralStroke1.strokeColorSelected,
    neutralStroke2: aliasTokens.neutralStroke2.strokeColorRest,
    neutralStroke3: aliasTokens.neutralStroke3.strokeColorRest,
    brandStroke1: aliasTokens.brandStroke1.strokeColorRest,
    brandStroke2: aliasTokens.brandStroke2.strokeColorRest,
    compoundBrandStroke1: aliasTokens.compoundBrandStroke1.strokeColorRest,
    compoundBrandStroke1Hover: aliasTokens.compoundBrandStroke1.strokeColorHover,
    compoundBrandStroke1Pressed: aliasTokens.compoundBrandStroke1.strokeColorPressed,
    neutralStrokeDisabled: aliasTokens.neutralStrokeDisabled.strokeColorRest,

    transparentStroke: aliasTokens.transparentStroke.strokeColorRest,
    transparentStrokeInteractive: aliasTokens.transparentStroke.strokeColorHover,
    transparentStrokeDisabled: aliasTokens.transparentStroke.strokeColorDisabled,

    strokeFocus1: aliasTokens.strokeFocus1.strokeColorRest,
    strokeFocus2: aliasTokens.strokeFocus2.strokeColorRest,
  };
}

export const createAliasTokens = memoize(createAliasTokensWorker);
