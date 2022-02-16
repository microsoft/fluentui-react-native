import { ViewProps } from 'react-native';

export const drawerName = 'Drawer';

export interface DrawerProps extends ViewProps {
  onShow?: () => void;
  onDismiss?: () => void;
  target?: React.RefObject<React.Component>;
  /* Component will check showDrawer boolean to toggle show*/
  showDrawer?: Boolean;
  /* Callback function that the component will call to toggle collapse after rendering*/
  toggleShow?: () => void;
  contentRef?: React.RefObject<React.Component>;
}

export interface NativeDrawerProps extends Omit<DrawerProps, 'target'> {
  target?: number | null;
  contentID?: number | null;
}

export type DrawerSlotProps = {
  root: NativeDrawerProps;
};


export interface DrawerTokens {

}

export interface DrawerState {

}

export interface DrawerInfo {
  props: DrawerProps;
  state: DrawerState;
}

export interface DrawerType {
  props: DrawerProps;
  slotProps: DrawerSlotProps;
  tokens: DrawerTokens;
  state: DrawerState;
}
