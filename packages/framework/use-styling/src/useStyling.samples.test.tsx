import * as React from 'react';
import { act } from 'react';
import type { TextProps, ColorValue } from 'react-native';
import { Text, View } from 'react-native';

import * as renderer from 'react-test-renderer';

import { buildProps } from './buildProps';
import type { ThemeHelper, UseStylingOptions } from './buildUseStyling';
import { buildUseStyling } from './buildUseStyling';

/**
 * Sample super simple theming implementation, shared by all the samples. This is intended to be illustrative,
 * not to be production ready theming code
 */

/**
 * The theme just contains global values and options for looking up component overrides
 */
type Theme = {
  globals: {
    backgroundColor: ColorValue;
    color: ColorValue;
    borderColor: ColorValue;
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

/**
 * Because the buildUseStyling utility is not opinionated about theming, the theming is injected via
 * a theme helper implementation. This allows for a framework to build an opinionated version with
 * whatever system they desire
 */
const themeHelper: ThemeHelper<Theme> & { setActive: (theme?: Partial<Theme>) => void } = {
  useTheme: () => current.theme,
  getComponentInfo: (theme: Theme, name: string) => theme.components[name],
  setActive: (theme?: Partial<Theme>) => {
    current.theme = theme ? { ...baseTheme, ...theme } : baseTheme;
  },
};

describe('useStyling samples', () => {
  /**
   * Sample #1 - Themeable text element
   *
   * This adds some default opinions for how a text element should be styled but only allows for customization
   * via theming
   */

  // the component itself is just text props with no style allowed
  type Sample1Props = Omit<TextProps, 'style'>;

  // internally the component just wraps a Text element
  type Sample1SlotProps = { content: TextProps };

  // the tokens for customization are just the color and font props from the theme
  type Sample1Tokens = {
    color?: ColorValue;
    fontFamily?: string;
    fontSize?: number;
  };

  // now create the styling hook, first the options so they can be reused later
  const sample1StylingOptions: UseStylingOptions<Sample1Props, Sample1SlotProps, Sample1Tokens, Theme> = {
    /**
     * tell the styling hook how to build up the tokens
     */
    tokens: [
      /** first the default values should come from the global theme section */
      (t: Theme) => ({
        color: t.globals.color,
        fontFamily: t.globals.fontFamily,
        fontSize: t.globals.fontSize,
      }),
      /** next we should look for a component reference to overlay */
      'Sample1',
    ],
    /**
     * Now provide the recipe for how to build props for the sub-components given the tokens
     */
    slotProps: {
      /** only one sub-component, a Text element called content, as a result this needs to build up TextProps */
      content: buildProps(
        /**
         * first input for buildProps is a function which takes tokens and a theme and returns props
         */
        (tokens: Sample1Tokens /*, theme: Theme */) => {
          return {
            style: { ...tokens },
          };
        },
        /**
         * The second input are the tokens used as inputs for the above function. This is similar to the way the useEffect hook
         * works in react.
         */
        ['color', 'fontFamily', 'fontSize'],
      ),
    },
  };

  // now build the actual hook from the options and theme helper
  const useStylingSample1 = buildUseStyling(sample1StylingOptions, themeHelper);

  // now the sample 1 component becomes simple to build, just merge the styled props with the input props
  const Sample1Text: React.FunctionComponent<Sample1Props> = (props) => {
    const styledProps = useStylingSample1(props).content;
    const merged = { ...props, ...styledProps };
    return <Text {...merged}>{props.children}</Text>;
  };

  /** first render the component with no updates */
  it('Sample1Text rendering with no overrides', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Sample1Text>Sample1a</Sample1Text>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  /** now re-theme the component via the components in the theme */
  it('Sample1Text rendering with some custom settings in the theme', () => {
    themeHelper.setActive({
      components: {
        Sample1: {
          color: 'pink',
          fontSize: 24,
        },
      },
    });
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Sample1Text>Sample1b</Sample1Text>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  /**
   * Sample 2 - take the styled text component from the first example and allow color to be set in props as well. This is
   * effectively saying that all other styles come from the theme except that color can be overriden via props.
   *
   * This will start with the definition from sample 1 and then extend it.
   */

  /** use the props from the first sample and just add a color setting */
  type Sample2Props = Sample1Props & { color?: string };

  /**
   * Build the styling hook for sample2. Because this isn't being recombined this is being specified inline rather
   * than using a separate options object. Both are fine.
   */
  const useStylingSample2 = buildUseStyling<Sample2Props, Sample1SlotProps, Sample1Tokens, Theme>(
    {
      /**
       * This just starts with the baseline styling from sample1, in particular we are using the recipes of how to turn
       * token values into the props for the internal sub-components. While this example is not super complex, for real-world
       * components, re-using these can be extremely valuable.
       *
       * With that in mind, this copies over the recipes for how to turn tokens into props, the customizations that
       * will be made are about how to ensure the tokens are set up correctly.
       */
      ...sample1StylingOptions,
      /**
       * In sample1 tokens are set to defaults from the global theme section, then patched with any values looked up with
       * the string 'Sample1'
       *
       * We want to maintain the logic of setting up the globals, but add an additional lookup for 'Sample2'. This might correspond
       * to saying that if we were making a variant of a 'Text' component called 'HeaderText', we might want to look up
       * customizations from 'Text' first, then override those customizations with those from 'HeaderText'
       *
       * If we didn't want to add the extra 'Sample2' lookup this line would be omitted. If we didn't want to look up 'Sample1' first
       * that could be filtered out of the array that is being copied
       */
      tokens: [...sample1StylingOptions.tokens, 'Sample2'],
      /**
       * This is the final bit of magic. The tokens will already have values set from the global theme, they will then be patched with
       * any customizations set into Sample1 and/or Sample2.
       *
       * If this value was omitted then the tokens would be passed to the slotProps recipies as is. To have those values patched from
       * the component props we add a list of the props which need to be passed into tokens. If all props should be spread into the
       * tokens then this value can be set to 'all'. If none should be passed it can be omitted or set to 'none'
       */
      tokensThatAreAlsoProps: ['color'],
    },
    themeHelper,
  );

  // the Sample2Text component is built the same way as sample1, just using the new hook that has been created
  const Sample2Text: React.FunctionComponent<Sample2Props> = (props) => {
    const styledProps = useStylingSample2(props).content;
    const merged = { ...props, ...styledProps };
    // delete the color key to not pass it through to the text props, could be done via destructuring, filtering, or any number of ways
    delete merged.color;
    // render the text
    return <Text {...merged}>{props.children}</Text>;
  };

  /** rendering the Sample2 component with the base theme */
  it('Sample2Text rendering with defaults and a color override', () => {
    themeHelper.setActive();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <View>
          <Sample2Text>Sample2 with defaults</Sample2Text>
          <Sample2Text color="green">Sample2 with color override via prop</Sample2Text>
        </View>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  /** now re-theme the component via the components in the theme */
  it('Sample2Text rendering with some custom settings in the theme', () => {
    themeHelper.setActive({
      components: {
        Sample1: {
          color: 'pink',
          fontSize: 24,
        },
        Sample2: {
          fontSize: 18,
          fontFamily: 'Helvetica',
        },
      },
    });
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <View>
          <Sample2Text>Sample2 with theme overrides set</Sample2Text>
          <Sample2Text color="purple">Sample2 with theme and color prop override</Sample2Text>
        </View>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});
