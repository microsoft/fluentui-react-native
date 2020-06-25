import * as React from 'react';
import { findNodeHandle } from 'react-native';
import { contextualMenuName, IContextualMenuProps, IContextualMenuSlotProps, IContextualMenuType } from './ContextualMenu.types';
import { settings } from './ContextualMenu.settings';
import { IUseComposeStyling, compose } from '@uifabricshared/foundation-compose';
import { useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import { Callout } from '@fluentui-react-native/callout';

export const ContextualMenu = compose<IContextualMenuType>({
  displayName: contextualMenuName,
  usePrepareProps: (props: IContextualMenuProps, useStyling: IUseComposeStyling<IContextualMenuType>) => {
    const { componentRef, target, ...rest } = props;
    const cmRef = useViewCommandFocus(componentRef);
    const [targetNativeTag, setTargetNativeTag] = React.useState<number>(undefined);

    React.useLayoutEffect(() => {
      if (target && target.current) {
        setTargetNativeTag(findNodeHandle(target.current));
      }
    }, [target]);

    const slotProps = mergeSettings<IContextualMenuSlotProps>(useStyling(props), {
      root: {
        ref: cmRef,
        target: targetNativeTag,
        ...rest
      }
    });

    return { slotProps };
  },
  settings: settings,
  slots: {
    root: Callout
  },
  styles: {
    root: [backgroundColorTokens, borderTokens]
  }
});

export default ContextualMenu;
