import { contextualMenuName, ContextualMenuProps, ContextualMenuSlotProps, ContextualMenuType } from './ContextualMenu.types';
import { settings } from './ContextualMenu.settings';
import { IUseComposeStyling, compose } from '@uifabricshared/foundation-compose';
import { useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import { Callout } from '@fluentui-react-native/callout';

export const ContextualMenu = compose<ContextualMenuType>({
  displayName: contextualMenuName,
  usePrepareProps: (props: ContextualMenuProps, useStyling: IUseComposeStyling<ContextualMenuType>) => {
    const { componentRef, target, ...rest } = props;
    const cmRef = useViewCommandFocus(componentRef);

    const slotProps = mergeSettings<ContextualMenuSlotProps>(useStyling(props), {
      root: {
        ref: cmRef,
        target: target,
        setInitialFocus: false,
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
