/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from 'react';
import { Platform, PlatformColor, View } from 'react-native';
import { Text } from '@fluentui/react-native';
import { Icon, RasterImageIconProps, SvgIconProps, FontIconProps } from '@fluentui-react-native/icon';
import { Test, TestSection, PlatformStatus } from '../Test';
import { ICON_TESTPAGE } from './consts';
import { E2ETestingIcon } from './IconE2ETest';
import { IconExperimental } from './IconExperimental';

const testImage = require('../../../../assets/icon_24x24.png');
const testTtf = require('./../../../assets/Font_Awesome_900.otf');
import TestSvg from './assets/test.svg';

const Icons: React.FunctionComponent = () => {
  const fontCustomFontProps: FontIconProps = {
    fontFamily: 'Font Awesome 5 Free',
    fontSrcFile: testTtf,
    codepoint: 0xf083,
    fontSize: 32,
  };

  const fontBuiltInProps = {
    fontFamily: 'Arial',
    codepoint: 0x2663,
    fontSize: 32,
  };

  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };

  // d20 icon by Lonnie Tapscott, licensed under CC BY, modified to use "currentColor"
  // https://thenounproject.com/search/?q=d20&i=2453700
  const svgD20DataUriProps: SvgIconProps = {
    uri: 'data:image/svg;base64,PHN2ZyBoZWlnaHQ9JzMwMHB4JyB3aWR0aD0nMzAwcHgnIGZpbGw9ImN1cnJlbnRDb2xvciIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeD0iMHB4IiB5PSIwcHgiPjx0aXRsZT5BcnRib2FyZCA2PC90aXRsZT48cGF0aCBkPSJNOTEuOSw2MS4zN2wtMTQtNDJhMiwyLDAsMCwwLTEuMzMtMS4yOWwtMzctMTFhMiwyLDAsMCwwLTIsLjUxbC0zMSwzMWEyLDIsMCwwLDAtLjQ4LDIuMDZsMTUsNDRBMiwyLDAsMCwwLDIyLjczLDg2bDM2LDVMNTksOTFhMiwyLDAsMCwwLDEuMzEtLjQ5bDMxLTI3QTIsMiwwLDAsMCw5MS45LDYxLjM3Wk0yNC40NCw4MiwzMS42LDQ3LjA1bDMzLjA4LDM0Wk03Ny4yNiwzMS42OSwzMi4zMyw0My42MWw3LjA2LTMxLjc1Wm0tNDcsMTIuMTJMMTEuMTYsMzkuNjYsMzYuODgsMTRaTTY2LjM4LDc5LjkyLDMyLjkxLDQ1LjUzLDc4LjM4LDMzLjQ2bC4xMi4zNS0xMiw0NlpNNzcsMjkuMjlsLTMwLjUyLTE2LDI4LDguMzFaTTEwLjY2LDQxLjZsMTkuMTYsNC4xN0wyMy4xNiw3OC4yNlpNNTguMzcsODYuODksMzUuNSw4My43MmwyNy4yMy0uNjJabTEwLjg1LTkuNDRMNzkuNjYsMzcuMjlsOCwyNC4wOFpNNDEuNjQsMzUuNWE3LDcsMCwwLDEsMS44NS0zLjgyLDE2LjkzLDE2LjkzLDAsMCwwLDEuODQtMi41OEEyLjQ0LDIuNDQsMCwwLDAsNDUuNCwyN2EyLjY3LDIuNjcsMCwwLDAtMS4xMy0xLjI4LDIuMzQsMi4zNCwwLDAsMC0xLjc0LS4yMWMtLjkuMi0xLjM4LjY0LTEuNDYsMS4zMWE0LjM1LDQuMzUsMCwwLDAsLjM2LDEuNzRsLTMsLjdhNiw2LDAsMCwxLS40Mi0zYy4yNi0xLjUxLDEuNC0yLjQ3LDMuNC0yLjkxYTYuNjIsNi42MiwwLDAsMSw0LjIxLjMxLDUuMjcsNS4yNywwLDAsMSwyLjczLDIuNzEsMy44MiwzLjgyLDAsMCwxLC4yMSwyLjg2LDcuNDYsNy40NiwwLDAsMS0xLjM1LDIuMjhsLS44NSwxLjA4cS0uODEsMS0xLjA4LDEuNDdBMi44MSwyLjgxLDAsMCwwLDQ1LDM1bDYuNjItMS43NCwxLjExLDIuNDVMNDIuMDksMzguNkE2Ljc1LDYuNzUsMCwwLDEsNDEuNjQsMzUuNVpNNTYuNTcsMjEuODFBMTMsMTMsMCwwLDEsNjAsMjYuMzZhMTAuNDgsMTAuNDgsMCwwLDEsMS40Nyw1LjI4Yy0uMSwxLjQtMS4wNiwyLjM2LTIuODcsMi44NWE1LjExLDUuMTEsMCwwLDEtNC43Ni0uODIsMTMsMTMsMCwwLDEtMy41My00LjkzLDkuNzgsOS43OCwwLDAsMS0xLjItNS4yNWMuMi0xLjMsMS4xOS0yLjE0LDMtMi41M0E1LjE4LDUuMTgsMCwwLDEsNTYuNTcsMjEuODFabS0xLjI2LDkuNjZhMi4xMywyLjEzLDAsMCwwLDIuMjUuODEsMS4yOSwxLjI5LDAsMCwwLDEtMS42NiwxMy43MiwxMy43MiwwLDAsMC0xLjMzLTMuNTcsMTUsMTUsMCwwLDAtMi4wNi0zLjM0QTIuMDksMi4wOSwwLDAsMCw1My4wNywyMywxLjI0LDEuMjQsMCwwLDAsNTIsMjQuNDYsMTIuNjcsMTIuNjcsMCwwLDAsNTMuMjMsMjgsMTUuMzMsMTUuMzMsMCwwLDAsNTUuMzEsMzEuNDdaIj48L3BhdGg+PC9zdmc+',
    viewBox: '25 10 50 50',
  };

  // This one doesn't get tinted because it doesn't use currentColor
  const svgUriProps: SvgIconProps = {
    uri: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Example.svg',
    viewBox: '0 0 1000 1000',
  };

  const rasterRainbowSpectrumProps: RasterImageIconProps = { src: testImage };

  // Chess icon by Justicon, licensed under CC BY
  // https://thenounproject.com/search/?q=chess&i=2960386
  const rasterChessProps: RasterImageIconProps = { src: { uri: 'https://static.thenounproject.com/png/2960386-200.png' } };

  // These flags can be adjusted for debugging purposes
  const showFontIcons = true;
  const showSvgIcons = true;
  const showRasterIcons = true;
  const shouldShowDataUri = Platform.OS !== 'android' && Platform.OS !== ('win32' as any);

  return (
    <View>
      {showFontIcons ? (
        <View>
          <Text>Font icons</Text>
          {
            // We've seen some issues getting Font Awesome to link properly on Apple platforms in the FURN test app specifically.
            // This shouldn't be an issue in other apps, though, so keeping this icon Windows-only for now is an easy workaround.
            // When Android support comes, the platform check can be adjusted accordingly.
            Platform.OS === 'windows' ? <Icon fontSource={fontCustomFontProps} width={100} height={100} color="purple" /> : null
          }
          <Icon fontSource={fontBuiltInProps} width={100} height={100} color="#060" />
        </View>
      ) : null}
      {showSvgIcons ? (
        <View>
          <Text>SVG icons</Text>
          <Icon svgSource={svgProps} width={100} height={100} color="orange" accessibilityLabel="Wheelchair" />
          {
            // TODO: Causes TypeError: Network request failed on Android
            shouldShowDataUri ? <Icon svgSource={svgD20DataUriProps} width={100} height={100} color="#7a7" /> : null
          }
          <Icon svgSource={svgUriProps} width={100} height={100} color="red" />
          {Platform.OS === ('win32' as any) && (
            <Icon svgSource={svgProps} width={100} height={100} color={PlatformColor('WindowText')} accessibilityLabel="Wheelchair" />
          )}
        </View>
      ) : null}
      {showRasterIcons ? (
        <View>
          <Text>Raster icons</Text>
          <Icon rasterImageSource={rasterRainbowSpectrumProps} width={100} height={100} color="green" />
          <Icon rasterImageSource={rasterChessProps} width={100} height={100} color="blue" />
        </View>
      ) : null}
    </View>
  );
};

const iconSections: TestSection[] = [
  {
    name: 'Icon',
    testID: ICON_TESTPAGE,
    component: Icons,
  },
  {
    name: 'Icon for E2E Testing',
    component: E2ETestingIcon,
  },
  {
    name: 'Default Icon',
    component: IconExperimental,
  },
];

export const IconTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Backlog',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description = 'Icons are styled images that can be fonts, svgs, or bitmaps';

  return <Test name="Icon Test" description={description} sections={iconSections} status={status}></Test>;
};
