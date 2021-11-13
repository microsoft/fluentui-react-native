# Testing Themes in Win32

The theming infrastructure works differently in win32 than on other platforms.

## Use direct debugging

Due to technical reasons the web debugger cannot support using the native module to look up native color information. While the theme in win32 has a fallback palette, this will not be an accurate representation of the default colors on the win32 platform. In order to get accurate color representation, you will need to use direct debugging.

## Change the Theme dropdown to the Office value

The default theme does not pick up on colors fed in from the native module. In order to see what will show in win32, you need to change the dropdown to the Office theme, so that it picks up the palette and brand values from the native module.

## Checking non-Colorful Themes

If you would like to see how other themes look, you can open the debug menu using the checkbox on the upper right of the app. You can select which Office theme you'd like to see, and then click "Reload UI" to have the changes apply. The theme does not update automatically as the palette information is only pulled when the app is loaded.

## High Contrast

In order to see what things will look like in High Contrast, you will need to:

1. Change your system to have high contrast mode on
2. Reload/Relaunch the app to ensure the palette has the right values using direct debugging
3. Change to the Office theme
