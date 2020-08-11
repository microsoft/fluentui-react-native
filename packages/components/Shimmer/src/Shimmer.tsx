/** @jsx withSlots */
import {
  compose,
  IColorTokens,
  UseSlots,
  buildProps,
  mergeProps,
  withSlots,
} from '@fluentui-react-native/experimental-framework';
import { requireNativeComponent } from 'react-native';
import { IViewProps } from '@fluentui-react-native/adapters';

const FRNShimmer = requireNativeComponent('FRNShimmerView');

const shimmerName = 'Shimmer';

/**
 * Shimmer tokens, these are the internally configurable values for Shimmer elements. In particular these
 * drive decisions on how to build the styles
 */
export interface ShimmerTokens {

}

/**
 * ViewProps props, based off of the standard react-native ViewProps with some new extensions
 */
export type ShimmerProps<TBase = IViewProps> = TBase & {

};

/**
 * These are the tokens which are also present in props. If specified in props this will override the values
 * from tokens.
 */
// const tokenProps: (keyof IColorTokens)[] = [];

/** Type to use for compose */
interface ShimmerType {
  props: ShimmerProps;
  slotProps: { root: IViewProps };
  tokens: ShimmerTokens;
}

export const Shimmer = compose<ShimmerType>({
  displayName: shimmerName,
  /** Settings for the use-styling hook */
  tokens: [
    t => ({}),
    shimmerName
  ],
  // states: [],
  // tokenProps,
  slotProps: {
    root: buildProps<IViewProps, IColorTokens>(() => ({}))
  },
  /** Settings for the useSlots that will be passed on */
  slots: { root: FRNShimmer },
  // filters: { root: filterTextProps },
  /** render function for the component */
  render: (props: ShimmerProps, useSlots: UseSlots<ShimmerType>) => {
    // stage one, execute any hooks, styling lookups to build the styled slot
    const Root = useSlots(props).root;
    // return a function used to complete the render
    return (rest: ShimmerProps, children: React.ReactNode) => <Root {...mergeProps(props, rest)}>{children}</Root>;
  }
});

export default Shimmer;
