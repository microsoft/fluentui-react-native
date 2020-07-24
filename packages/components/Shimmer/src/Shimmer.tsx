import * as React from 'react';
import { requireNativeComponent } from 'react-native';

export const FRNShimmer = requireNativeComponent('FRNShimmerView')

export class Shimmer extends React.Component<{}> {

  public render() {
    return (
      <FRNShimmer />
    );
  }
}

export default Shimmer;