import * as React from 'react';
import { requireNativeComponent } from 'react-native';
const FRNAvatar = requireNativeComponent('FRNAvatar');

export class Avatar extends React.Component<{}> {

  public render() {
    return (
      <FRNAvatar
      />
    );
  }
}

export default Avatar;