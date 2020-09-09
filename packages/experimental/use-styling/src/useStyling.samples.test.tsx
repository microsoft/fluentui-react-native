import { ThemeHelper, buildUseStyling, UseStylingOptions } from './buildUseStyling';
import { TextProps, Text } from 'react-native';
import { buildProps } from './buildProps';
import * as renderer from 'react-test-renderer';
import * as React from 'react';

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
    color?: string;
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
  const Sample1Text: React.FunctionComponent<Sample1Props> = props => {
    const styledProps = useStylingSample1(props).content;
    const merged = { ...props, ...styledProps };
    return <Text {...merged}>{props.children}</Text>;
  };

  /** first render the component with no updates */
  it('Sample1Text rendering with no overrides', () => {
    const tree = renderer.create(<Sample1Text>Sample1a</Sample1Text>).toJSON();
    expect(tree).toMatchSnapshot();
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
    const tree = renderer.create(<Sample1Text>Sample1b</Sample1Text>).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
