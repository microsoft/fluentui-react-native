/** @jsxRuntime classic */
/** @jsx withSlots */
import type { CSSProperties } from 'react';

import { mergeProps } from '@fluentui-react-native/framework-base';
import { withSlots, stagedComponent } from '@fluentui-react-native/use-slot';
import * as renderer from 'react-test-renderer';

import { buildUseSlots } from './buildUseSlots';

// types for web
type TextProps = { style?: CSSProperties };
type ViewProps = { style?: CSSProperties };
type ViewStyle = CSSProperties;
type TextStyle = CSSProperties;

/**
 * This file contains samples and description to help explain what the useSlots hook does and why it is useful
 * for building components.
 */

describe('useSlots sample code test suite', () => {
  /**
   * The first mechanism to understand is the stagedComponent mechanic. This allows a component to be written, separating
   * hook calls and component rendering. This allows it to be safely called as a function by a higher order component, even conditionally.
   */

  /**
   * Example #1: Single level simple component ----------------------------------------
   *
   * First we are going to create a wrapped text component that bolds all text. One component will be authored as a staged
   * component and one as a regular component.
   */

  const boldBaseProps: TextProps = { style: { fontWeight: 900 } };

  /**
   * First create the bold text in the standard way. This is just a function component.
   */
  const BoldTextStandard: React.FunctionComponent<React.PropsWithChildren<TextProps>> = (props: React.PropsWithChildren<TextProps>) => {
    /**
     * Pick out the children to pass them on to the child Text element
     */
    const { children, ...rest } = props;

    /**
     * Now render the text, merging the baseProps with the style updates with the rest param. Note that this leverages the fact
     * that mergeProps will reliably produce style objects with the same reference, given the same inputs.
     */
    return <span {...mergeProps(boldBaseProps, rest)}>{children}</span>;
  };
  BoldTextStandard.displayName = 'BoldTextStandard';

  /**
   * To write the same component using the staged pattern is only slightly more complex. The pattern involves splitting the component rendering into
   * two parts and executing any hooks in the first part.
   *
   * The stagedComponent function takes an input function of this form and wraps it in a function component that react knows how to render
   */
  const BoldTextStaged = stagedComponent((props: React.PropsWithChildren<TextProps>) => {
    /**
     * This section would be where hook/styling code would go, props here would include everything coming in from the base react tree with the
     * exception of children, which will be passed in stage 2.
     */
    return (extra: TextProps, children: React.ReactNode) => {
      /**
       * extra are additional props that may be filled in by a higher order component. They should not include styling and are only props the
       * enclosing component are passing to the JSX elements
       */
      return <span {...mergeProps(boldBaseProps, props, extra)}>{children}</span>;
    };
  });
  BoldTextStaged.displayName = 'BoldTextStaged';

  it('renders sample 1 - the two types of basic bold text components', () => {
    const styleToMerge: TextStyle = { color: 'black' };

    /**
     * First render the staged component. This invokes the wrapper that was built by the stagedComponent function
     */
    const wrapper = renderer
      .create(
        <div>
          <BoldTextStaged style={styleToMerge}>Staged component at one level</BoldTextStaged>
          <BoldTextStandard style={styleToMerge}>Standard component of a single level</BoldTextStandard>
        </div>,
      )
      .toJSON();
    expect(wrapper).toMatchSnapshot();
  });

  /**
   * Example #2 - Simple component containing another simple component -------------------------------------
   *
   * Next we will build a layer on top of the previously authored components to turn the bold text components into header components. This is
   * to illustrate the way in which components can be commonly built on top of other simpler components.
   */
  const headerBaseProps: TextProps = { style: { fontSize: 20 } };

  /**
   * The standard way of doing things is a repeat of what happens above. Grab the children, pass them on, merge the rest of the props with
   * base props.
   *
   * This again leverages style merging via mergeProps to avoid changing the references of the style objects on every render
   */
  const HeaderStandard: React.FunctionComponent<React.PropsWithChildren<TextProps>> = (props) => {
    const { children, ...rest } = props;
    return <BoldTextStandard {...mergeProps(headerBaseProps, rest)}>{children}</BoldTextStandard>;
  };
  HeaderStandard.displayName = 'HeaderStandard';

  /**
   * To consume the staged component we'll use the use slots hook builder. This allows easy consumption of staged components (or standard components)
   * This will be described in more detail further on but in this case the component has a single child component, so it only has one slot that we
   * will call 'text'
   *
   * This should be built once, and consumed by the component, not built on the fly inside
   */
  const useHeaderSlots = buildUseSlots({ slots: { text: BoldTextStaged } });

  /**
   * Now author the staged component using the slot hook
   */
  const HeaderStaged = stagedComponent((props: React.PropsWithChildren<TextProps>) => {
    /**
     * Call the slots hook (or any hook) outside of the inner closure. The useSlots hook will return an object with each slot as a renderable
     * function. The hooks for sub-components will be called as part of this call. Props passed in at this point will be the props that appear
     * in outer part of the staged component. (For this example `props`)
     *
     * Note that while we are passing in props, in the simple usage case it isn't used and could be omitted if desired
     * */
    const BoldText = useHeaderSlots(props).text;

    /** Now the inner closure, pretty much the same as before */
    return (extra: TextProps, children: React.ReactNode) => {
      /**
       * Instead of rendering the <BoldTextStageed> component directly we render using the slot. If this is a staged component it will call the
       * inner closure directly, without going through createElement. Entries passed into the JSX, including children, are what appear in the
       * props of the inner closure. (In this example `extra`)
       *
       * NOTE: this requires using the withSlots helper via the jsx directive. This knows how to pick apart the entries and just call the second
       * part of the function
       */
      return <BoldText {...mergeProps(headerBaseProps, props, extra)}>{children}</BoldText>;
    };
  });
  HeaderStaged.displayName = 'HeaderStaged';

  /**
   * Look at the snapshots to compare the rendered output. The staged component will skip the intermediate levels of the react hieararchy while
   * still rendering to the correct primitives.
   */
  it('renders sample 2 = the two types of two level header components', () => {
    const styleToMerge: TextStyle = { color: 'black' };

    /**
     * First render the staged component. This invokes the wrapper that was built by the stagedComponent function
     */
    const wrapper = renderer
      .create(
        <div>
          <HeaderStaged style={styleToMerge}>Staged component with two levels</HeaderStaged>
          <HeaderStandard style={styleToMerge}>Standard component with two levels</HeaderStandard>
        </div>,
      )
      .toJSON();
    expect(wrapper).toMatchSnapshot();
  });

  /**
   * Example #3: Complex components built using useSlots --------------------------------------------------------------------
   *
   * We'll build a component that shows two labels, a header and a caption, embedded inside a view
   */

  type HeaderWithCaptionProps = ViewProps & { headerColor?: string; captionColor?: string; captionText?: string };

  /** standard props for the container */
  const containerProps: ViewProps = { style: { display: 'flex', flexDirection: 'column' } };

  /**
   * add a quick cache to ensure that we don't thrash the styles. This is a danger any time a value from a style is added as
   * a prop on a component
   */
  const colorProps = {};
  const getColorProps = (value?: string) => {
    if (value !== undefined) {
      colorProps[value] = colorProps[value] || { style: { color: value } };
      return colorProps[value];
    }
    return {};
  };

  /**
   * now just create the component like a standard react functional component
   */
  const CaptionedHeaderStandard: React.FunctionComponent<React.PropsWithChildren<HeaderWithCaptionProps>> = (props) => {
    const { headerColor, captionColor, captionText, children, ...rest } = props;
    const headerColorProps = getColorProps(headerColor);
    const captionColorProps = getColorProps(captionColor);
    return (
      <div {...mergeProps(containerProps, rest)}>
        <HeaderStandard {...headerColorProps}>{children}</HeaderStandard>
        {captionText && <BoldTextStandard {...captionColorProps}>{captionText}</BoldTextStandard>}
      </div>
    );
  };
  CaptionedHeaderStandard.displayName = `CaptionedHeaderStandard';`;

  /**
   * now build the same component using slots hook. This will also add use of the style injection pattern
   */
  const useCaptionedHeaderSlots = buildUseSlots({
    /** Slots are just like above, this component will have three sub-components */
    slots: {
      container: 'div',
      header: HeaderStaged,
      caption: BoldTextStaged,
    },
    /** useStyling is an optional function that turns props into props for the sub-components */
    useStyling: (props: HeaderWithCaptionProps) => ({
      container: containerProps,
      header: getColorProps(props.headerColor),
      caption: getColorProps(props.captionColor),
    }),
  });

  /** a mask to clear props that we don't want to pass to the inner view */
  const clearCustomProps = { headerColor: undefined, captionColor: undefined };

  /**
   * now use the hook to implement it as a staged component
   */
  const CaptionedHeaderStaged = stagedComponent<React.PropsWithChildren<HeaderWithCaptionProps>>((props) => {
    // At the point where this is called the slots are initialized with the initial prop values from useStyling above
    const Slots = useCaptionedHeaderSlots(props);
    return (extra: HeaderWithCaptionProps, children: React.ReactNode) => {
      // merge the props together, picking out the caption text and clearing any custom values we don't want forwarded to the view
      const { captionText, ...rest } = mergeProps(props, extra, clearCustomProps);

      // now render using the slots. Any values passed in via JSX will be merged with values from the slot hook above
      return (
        <Slots.container {...rest}>
          <Slots.header>{children}</Slots.header>
          {captionText && <Slots.caption>{captionText}</Slots.caption>}
        </Slots.container>
      );
    };
  });
  CaptionedHeaderStaged.displayName = 'CaptionedHeaderStaged';

  it('renders sample 3 - the two types of higher order header components', () => {
    const styleToMerge: ViewStyle = { backgroundColor: 'gray', borderColor: 'purple', borderWidth: 1 };

    /**
     * Render the two sets of components. Note in the snapshots how the render tree layers for the standard approach are starting
     * to add up.
     */
    const wrapper = renderer
      .create(
        <div>
          <span>--- SIMPLE USAGE COMPARISON ---</span>
          <CaptionedHeaderStandard style={styleToMerge}>Standard HOC</CaptionedHeaderStandard>
          <CaptionedHeaderStaged style={styleToMerge}>Staged HOC</CaptionedHeaderStaged>
          <span>--- COMPARISON WITH CAPTIONS ---</span>
          <CaptionedHeaderStandard style={styleToMerge} captionText="Caption text">
            Standard HOC with Caption
          </CaptionedHeaderStandard>
          <CaptionedHeaderStaged style={styleToMerge} captionText="Caption text">
            Staged HOC with Caption
          </CaptionedHeaderStaged>
          <span>--- COMPARISON WITH CAPTIONS AND CUSTOMIZATIONS ---</span>
          <CaptionedHeaderStandard style={styleToMerge} captionText="Caption text" captionColor="yellow" headerColor="red">
            Standard HOC with caption and customizations
          </CaptionedHeaderStandard>
          <CaptionedHeaderStaged style={styleToMerge} captionText="Caption text" captionColor="yellow" headerColor="red">
            Staged HOC with caption and customizations
          </CaptionedHeaderStaged>
        </div>,
      )
      .toJSON();
    expect(wrapper).toMatchSnapshot();
  });
});
