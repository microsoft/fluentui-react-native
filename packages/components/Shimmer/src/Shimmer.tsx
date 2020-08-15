import { requireNativeComponent, View, ViewProps, processColor } from 'react-native';
import * as React from 'react';
import * as PropTypes from 'prop-types';

const COMPONENT_NAME = 'MSFShimmerView';

/**
 * Native view wrapper
 */
const NativeShimmerView = requireNativeComponent(COMPONENT_NAME);

export interface IShimmerViewAppearance {
  /**
   * Color to tint the shimmer boxes. Defaults to the Fabric default color.
   */
  tintColor?: string;

  /**
   * Corner radius on each view.
   */
  cornerRadius?: number;

  /**
   * Corner radius on each UILabel. Set to < 0 to disable and use default `cornerRadius`.
   */
  labelCornerRadius?: number;

  /**
   * usesTextHeightForLabels: True to enable shimmers to auto-adjust to font height for a UILabel -- this
   * will more accurately reflect the text in the label rect rather than using the bounding box. `labelHeight`
   * will take precendence over this property.
   */
  usesTextHeightForLabels?: boolean;

  /**
   * If greater than 0, a fixed height to use for all UILabels. This will take precedence
   * over `usesTextHeightForLabels`. Set to less than 0 to disable.
   */
  labelHeight?: number;
}

export interface IShimmerViewProps {
  /**
   * Appearance of the views that are shimmered. If not passed, the default will be used.
   */
  appearance?: IShimmerViewAppearance;
}

/**
 * Shimmering view (loading state).
 *
 * @discussion Wrap an arbitrary number of subviews with Shimmer to have them all shimmer together.
 * Multiple shimmers added to a page (eg as cells in a FlatList) will all be synchronized so they move together. See the
 * example app for a more advanced demo.
 *
 * @note Only non-hidden leaf views will be considered for shimmering so that views wrapped for a flexbox layout will not
 * overshadow children. (see example)
 *
 * @example
```
<Shimmer style={{ flex: 1 }}>
    <View style={{ width: 40, height: 40 }} /> // <--- This will be shimmered
    <View style={{ flex: 2, flex-direction: 'column' }} > // <-- This will be ignored (not a leaf)
      <Text style={{ width: 100 }}/> // <--- This will be shimmered
      <Text style={{ width: 70 }}/> // <--- This will be shimmered
    </View>
</Shimmer>
```
 */
export class Shimmer extends React.PureComponent<ViewProps & IShimmerViewProps> {
  // tslint:disable-next-line:no-any
  public static propTypes: any = {
    tintColor: PropTypes.object
  };

  public render(): JSX.Element | null {
    if (NativeShimmerView === undefined) {
      return <View {...this.props} />;
    }

    const appearance = this.props.appearance;
    return (
      <NativeShimmerView
        {...this.props}
        appearance={{
          ...appearance,
          tintColor: appearance && appearance.tintColor ? processColor(appearance.tintColor) : undefined
        }}
      />
    );
  }
}
