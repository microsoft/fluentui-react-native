import * as React from 'react';
import type { TextProps } from 'react-native';
import { Text, View } from 'react-native';

import { immutableMerge } from '@fluentui-react-native/framework-base';
import { mergeStyles } from '@fluentui-react-native/framework-base';
import * as renderer from 'react-test-renderer';

import { buildUseTokens } from './buildUseTokens';

/**
 * Sample super simple theming implementation, shared by all the samples. This is intended to be illustrative,
 * not to be production ready theming code
 */

/**
 * The theme just contains global values and options for looking up component overrides
 */
type Theme = {
  globals: {
    backgroundColor: string;
    color: string;
    borderColor: string;
    fontFamily: string;
    fontSize: number;
  };
  components: {
    [key: string]: any;
  };
};

/**
 * The default/base theme just contains base values
 */
const baseTheme: Theme = {
  globals: {
    backgroundColor: 'white',
    color: 'black',
    borderColor: 'blue',
    fontFamily: 'Arial',
    fontSize: 12,
  },
  components: {},
};

const current = { theme: baseTheme };

const useTheme = () => current.theme;

const setActiveTheme = (theme?: Partial<Theme>) => {
  current.theme = (theme && immutableMerge<Theme>(baseTheme, theme as Theme)) || baseTheme;
};

/**
 * Helper function used to look up a component in the theme. Having this injected allows this module to not be dependent on the shape of
 * the theme used.
 */
const getComponentInfo = (theme: Theme, name: string) => theme.components[name];

describe('useTokens samples', () => {
  /**
   * Sample #1 - Themeable text element
   *
   * This adds some default opinions for how a text element should be styled but only allows for customization
   * via theming
   */

  // the tokens for customization are just the color and font props from the theme
  type Sample1Tokens = {
    color?: string;
    fontFamily?: string;
    fontSize?: number;
  };

  const useTokensSample1 = buildUseTokens<Sample1Tokens, Theme>(
    getComponentInfo,
    /** first the default values should come from the global theme section */
    (t: Theme) => ({
      color: t.globals.color,
      fontFamily: t.globals.fontFamily,
      fontSize: t.globals.fontSize,
    }),
    /** next we should look for a component reference to overlay */
    'SampleText',
  );

  const SampleText1: React.FunctionComponent<TextProps> = (props) => {
    // standard props splitting
    const { style, children, ...rest } = props;

    // typically this would start with a call to retrieve the theme from the context via whatever method is appropriate
    const theme = useTheme();

    // next the tokens are resolved from the theme, a cache specific to this theme is returned as well to allow for
    // style objects to not be rebuilt unnecessarily
    const [tokens, cache] = useTokensSample1(theme);

    // build up the text style, or the full props as appropriate
    const [styleFromTokens] = cache(
      /**
       * first build the style object
       * - this executes once for every unique set of keys.
       * - The cache is already unique for this theme
       */
      () => ({ ...tokens }),
      /**
       * now specify the keys
       * - because the only changing variable is the theme
       * - ...and all the style properties are either constant or come from the tokens
       * - ...no keys need to be specified
       * - this means that only one style object will be created per component + theme pair
       */
      [],
    );

    // merge the props from the tokens with anything passed in via style. This is internally cached via object identity
    // so the merged style object won't change identity unless one of the two inputs changes identity.
    const mergedStyle = mergeStyles(styleFromTokens, style);

    // now just render the element, forwarding the props, setting the merged style, then passing the children as appropriate
    return (
      <Text {...rest} style={mergedStyle}>
        {children}
      </Text>
    );
  };

  beforeEach(() => {
    setActiveTheme();
  });

  /** first render the component with no updates */
  it('Sample1Text rendering with no overrides', () => {
    const tree = renderer.create(<SampleText1>Sample1a</SampleText1>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  /** now re-theme the component via the components in the theme */
  it('Sample1Text rendering with some custom settings in the theme', () => {
    setActiveTheme({
      components: {
        SampleText: {
          color: 'pink',
          fontSize: 24,
        },
      },
    });
    const tree = renderer.create(<SampleText1>Sample1b</SampleText1>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  /**
   * Sample 2 - take the styled text component from the first example and allow color to be set in props as well. This is
   * effectively saying that all other styles come from the theme except that color can be overriden via props.
   */

  /** use the props from the first sample and just add a color setting */
  type Sample2Props = TextProps & { color?: string };

  // the Sample2Text component is built the same way as sample1, just using the new hook that has been created
  const SampleText2: React.FunctionComponent<Sample2Props> = (props) => {
    const { color, style, children, ...rest } = props;
    const theme = useTheme();

    // this starts the same as sample1, extract tokens from the theme and get a theme specific cache object
    const [tokens, cache] = useTokensSample1(theme);

    // now when building up the style this time, the resulting style object is based upon both the theme and the passed
    // in value of colors. Because the theme is already part of the cache definition, only color needs to be a key
    const styleFromTokens = cache(
      /** build the style, only patch the color if it has a value, otherwise the theme value would get stomped if color was undefined */
      () => ({ ...tokens, ...(color && { color }) }),
      /** use color as an additional key for the style */
      [color],
    );

    // now just render, this time merging styles inline to make it a bit shorter
    return (
      <Text {...rest} style={mergeStyles(styleFromTokens, style)}>
        {children}
      </Text>
    );
  };

  /** rendering the Sample2 component with the base theme */
  it('Sample2Text rendering with defaults and a color override', () => {
    const tree = renderer
      .create(
        <View>
          <SampleText2>Sample2 with defaults</SampleText2>
          <SampleText2 color="green">Sample2 with color override via prop</SampleText2>
        </View>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  /** now re-theme the component via the components in the theme */
  it('Sample2Text rendering with some custom settings in the theme', () => {
    setActiveTheme({
      components: {
        SampleText: {
          fontSize: 18,
          fontFamily: 'Helvetica',
        },
      },
    });
    const tree = renderer
      .create(
        <View>
          <SampleText2>Sample2 with theme overrides set</SampleText2>
          <SampleText2 color="purple">Sample2 with theme and color prop override</SampleText2>
        </View>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
