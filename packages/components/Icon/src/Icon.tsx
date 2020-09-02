/*
This is a prototype of the Icon control. The icon control should be able to show
fonts, svgs, and raster images, and style them appropriately using our fluentui
styling system.

The primitive used to render raster images is just the existing Image control. We
just need to give it the right properties.

The primitive used to render svgs is from the react-native-svg community package.
Netui should now be able to support its controls. The relevent items from that package
are Svg, SvgUri, SvgXml. React-native-transformer is used to import svgs from
the bundle. Check out https://github.com/kristerkari/react-native-svg-transformer for
how to use it.

Font icon rendering uses the Text control to render a single character codepoint
from a font in the bundle. This should work fine on the js side, but the netui
native control RNText needs to register the font in the bundle specified by
fontFamily. In its current implementation the Text control will not be able to find
any fonts specified from the bundle and will just print the codepoint from some default
font. So currently the font icon drawing code only works with already registered fonts.
It probably works with wingdings.

From talking with some text folks the api to use for font registration is AddFontResourceEx().
They pointed me to code in GDIAssistant_fontservice.cpp as an example.

Using slots in the render function like in the code commented out in the render function
gives me an assert(c63kb) with the message "Invariant violation: Objects are not valid as a react
child(found object with keys {})"". I'm also having trouble with the web debugger so I haven't
been able to debug what is actually going on.


TODO:
-Hook up to all the styled properties and tokens
-Implement registration of bundled fonts on the win32 side. The font file should be
  specifiable in the fontFamily property.
-Right now I've had some problems using the slots pattern so the render function doesn't
  use slots appropriately. We should make Icon more conformant to the slots pattern.
*/


import * as React from 'react';
import {IIconProps, ISvgIconProps, IFontIconProps} from './Icon.types';
import * as ReactNative from 'react-native';
import { Text } from '@fluentui-react-native/text';
import {SvgUri} from 'react-native-svg'
import * as assetRegistry from 'react-native/Libraries/Image/AssetRegistry';
import { stagedComponent, useTheme, mergeProps, getMemoCache } from '@fluentui-react-native/framework';

function RenderRasterImage(iconProps: IIconProps) {
  const { width, height } = iconProps;
  return (
    <ReactNative.Image
      source = {iconProps.rasterImageSource.src}
      style = {{width: width, height: height}}
    />
  )
}

function RenderFontIcon(iconProps: IIconProps) {
  const fontSource: IFontIconProps = iconProps.fontSource;
  const style = {...fontSource };

  if (style.fontSrcFile != undefined) {
    const asset = assetRegistry.getAssetByID(style.fontSrcFile);
    style.fontFamily = `${style.fontFamily}#${asset.httpServerLocation}/${asset.name}.${asset.type}`;
  }

  const char = String.fromCharCode(fontSource.codepoint);
  return(
    <Text style={style}>{char}</Text>
  );
}

function RenderSvg(iconProps: IIconProps) {
  const svgIconProps: ISvgIconProps = iconProps.svgSource;
  const { width, height } = iconProps;
  const viewBox = iconProps.svgSource.viewBox;

  if (svgIconProps.src) {
    return (
        <svgIconProps.src
          viewBox = {viewBox}
          width = {width}
          height = {height}
          color = {svgIconProps.color}
        />
    );
  }
  else if (svgIconProps.uri)
  {
    return (
        <SvgUri uri = {svgIconProps.uri}
          viewBox = {viewBox}
          width = {width}
          height = {height}
          color = {svgIconProps.color}
        />
    )
  }
  else {
    return null;
  }
}

export const Icon = stagedComponent((props: IIconProps) => {

  return (extra: IIconProps) => {
    const theme = useTheme();
    const style = { color: theme.colors.buttonText };
    const newProps = mergeProps<IIconProps>(style, props);

     if (newProps.svgSource) {
      return RenderSvg(newProps);
    }
    else if (newProps.fontSource) {
      return RenderFontIcon(newProps);
    }
    else if (newProps.rasterImageSource) {
      return RenderRasterImage(newProps);
    }
    else {
      return null;
    }
  }
});

/*
export const Icon = compose < IIconType > ({
    displayName: iconName,
    usePrepareProps: (userProps: IIconProps, useStyling: IUseComposeStyling<IIconType>): IIconRenderData => {
    const {
      ariaLabel,
      svgSource,
      fontSource,
      rasterImageSource,
      width,
      height } = userProps;

    const state = {
      svgSource,
      fontSource,
      rasterImageSource,
      width,
      height
    };

    const styleProps = useStyling(userProps);
    const slotProps = mergeSettings<IIconSlotProps>(styleProps, {
      root: {
        ...userProps,
        ref: null,
        accessibilityRole: 'img',
        accessibilityLabel: ariaLabel,
      },
    });

    return {slotProps , state};
    },
    render: (Slots: ISlots<IIconSlotProps>, renderData: IIconRenderData,) => {
      Slots;
      if (renderData.state.svgSource) {
        return RenderSvg(renderData)
      }
      else if (renderData.state.rasterImageSource) {
        return RenderRasterImage(renderData);
      }
      else if (renderData.state.fontSource) {
        return RenderFontIcon(renderData);
      }
      else {
        return null;
      }

    },
    slots: {
      root: 'View',
    },

  styles: {
    root: [],
  }
  }); */

export default Icon;