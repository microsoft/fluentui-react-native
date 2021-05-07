# Android-theme

Code and definitions for creating an Android Theme for FluentUI React Native.

The theme follows color, typography, spacing and other values to closely match [FluentUI Android](https://github.com/microsoft/fluentui-android). The theme is work in progress and changes are expected.

## Typography and Fonts

The theme package contains font families, weights, sizes, variants as per the FluentUI Typography guidelines. The families object points to corresponding system fonts.

Note: Android only supports the following fontWeight values: `"normal" (same as "400"), "bold" (same as "700")`. Any other fontWeight value defaults to "400".  
This theme contains families - `primary` for (Roboto, weight="400"), `primarySemibold` for (Roboto, weight="500") and `primaryLight` for (Roboto, weight="300")
