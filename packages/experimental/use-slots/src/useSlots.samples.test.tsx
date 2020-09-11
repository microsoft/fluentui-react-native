/** @jsx withSlots */
import { withSlots } from './withSlots';
import { stagedComponent } from './stagedComponent';
import { TextProps, Text, TextStyle, View } from 'react-native';
import { mergeProps } from '@fluentui-react-native/merge-props';
import { buildUseSlots } from './buildUseSlots';
import toJson from 'enzyme-to-json';
import { mount } from 'enzyme';

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
   * First we are going to create a wrapped text component that bolds all text. One component will be authored as a staged
   * component and one as a regular component.
   */

  const boldBaseProps: TextProps = { style: { fontWeight: '900' } };

  /**
   * First create the bold text in the standard way. This is just a function component.
   */
  const BoldTextStandard: React.FunctionComponent<TextProps> = (props: React.PropsWithChildren<TextProps>) => {
    /**
     * Pick out the children to pass them on to the child Text element
     */
    const { children, ...rest } = props;

    /**
     * Now render the text, merging the baseProps with the style updates with the rest param. Note that this leverages the fact
     * that mergeProps will reliably produce style objects with the same reference, given the same inputs.
     */
    return <Text {...mergeProps(boldBaseProps, rest)}>{children}</Text>;
  };
  BoldTextStandard.displayName = 'BoldTextStandard';

  /**
   * To write the same component using the staged pattern is only slightly more complex. The pattern involves splitting the component rendering into
   * two parts and executing any hooks in the first part.
   *
   * The stagedComponent function takes an input function of this form and wraps it in a function component that react knows how to render
   */
  const BoldTextStaged = stagedComponent((props: TextProps) => {
    /**
     * This section would be where hook/styling code would go, props here would include everything coming in from the base react tree with the
     * exception of children, which will be passed in stage 2.
     */
    return (extra: TextProps, children: React.ReactNode) => {
      /**
       * extra are additional props that may be filled in by a higher order component. They should not include styling and are only props the
       * enclosing component are passing to the JSX elements
       */
      return <Text {...mergeProps(boldBaseProps, props, extra)}>{children}</Text>;
    };
  });
  BoldTextStaged.displayName = 'BoldTextStaged';

  /**
   * The demos of the code use enzyme with JSDom to show the full tree. This has the side effect of doubling up primitive elements in the output
   * JSON. This is an issue with rendering react-native with enzyme but in real usage the nodes only render once.
   */
  it('renders the two types of basic bold text components', () => {
    const styleToMerge: TextStyle = { color: 'black' };

    /**
     * First render the staged component. This invokes the wrapper that was built by the stagedComponent function
     */
    const wrapper = mount(<BoldTextStaged style={styleToMerge}>Staged component at one level</BoldTextStaged>);
    expect(toJson(wrapper)).toMatchSnapshot();

    /**
     * Render the standard version of the component. Output is pretty much identical to the staged component (if you look at the snapshot)
     */
    const wrapper2 = mount(<BoldTextStandard style={styleToMerge}>Standard component of a single level</BoldTextStandard>);
    expect(toJson(wrapper2)).toMatchSnapshot();
  });

  /**
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
  const HeaderStandard: React.FunctionComponent<TextProps> = (props) => {
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
  const HeaderStaged = stagedComponent((props: TextProps) => {
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
   * The demos of the code use enzyme with JSDom to show the full tree. This has the side effect of doubling up primitive elements in the output
   * JSON. This is an issue with rendering react-native with enzyme but in real usage the nodes only render once.
   */
  it('renders the two types of two level header components', () => {
    const styleToMerge: TextStyle = { color: 'black' };

    /**
     * First render the staged component. This invokes the wrapper that was built by the stagedComponent function
     */
    const wrapper = mount(<HeaderStaged style={styleToMerge}>Staged component with two levels</HeaderStaged>);
    expect(toJson(wrapper)).toMatchSnapshot();

    /**
     * Render the standard version of the component. Output is pretty much identical to the staged component (if you look at the snapshot)
     */
    const wrapper2 = mount(<HeaderStandard style={styleToMerge}>Standard component with two levels</HeaderStandard>);
    expect(toJson(wrapper2)).toMatchSnapshot();
  });
});
