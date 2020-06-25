/** @jsx withSlots */
import * as React from 'react';
import { Image, View } from 'react-native';
import { IContextualMenuItemSlotProps, IContextualMenuItemState, IContextualMenuItemProps, IContextualMenuItemRenderData, contextualMenuItemName, IContextualMenuItemType } from './ContextualMenuItem.types';
import { compose, IUseComposeStyling } from '@uifabricshared/foundation-compose';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { Text } from '@fluentui-react-native/text';
import { settings } from './ContextualMenuItem.settings';
import { backgroundColorTokens, borderTokens, textTokens, foregroundColorTokens } from '@fluentui-react-native/tokens';
import { filterViewProps, filterImageProps } from '@fluentui-react-native/adapters';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { useAsPressable, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';

export const ContextualMenuItem = compose<IContextualMenuItemType>({
  displayName: contextualMenuItemName,
  usePrepareProps: (userProps: IContextualMenuItemProps, useStyling: IUseComposeStyling<IContextualMenuItemType>) => {
    const {
      icon,
      text,
      accessibilityLabel = userProps.text,
      onClick,
      testID,
      ...rest
    } = userProps;

    // attach the pressable state handlers
    const pressable = useAsPressable({ ...rest, onPress: onClick });
    const onKeyUp = React.useCallback(
      e => {
        if (onClick && (e.nativeEvent.key === 'Enter' || e.nativeEvent.key === ' ')) {
          onClick();
          e.stopPropagation()
        }
      },
      [onClick]
    );

    // set up state
    const state: IContextualMenuItemState = {
      ...pressable.state,
      disabled: userProps.disabled,
      content: !!text,
      icon: !!icon

    };

    const cmRef = useViewCommandFocus(userProps.componentRef);
    // grab the styling information, referencing the state as well as the props
    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);
    // create the merged slot props
    const slotProps = mergeSettings<IContextualMenuItemSlotProps>(styleProps, {
      root: {
        ...pressable.props,
        ref: cmRef,
        onKeyUp: onKeyUp,
        accessibilityLabel: accessibilityLabel,
      },
      content: { children: text, testID },
      icon: { source: icon }
    });

    return { slotProps, state };
  },
  settings,
  render: (Slots: ISlots<IContextualMenuItemSlotProps>, renderData: IContextualMenuItemRenderData, ...children: React.ReactNode[]) => {

    // We shouldn't have to specify the source prop on Slots.icon, here, but we need another drop from @uifabricshared
    return (
      <Slots.root>
        <Slots.stack>
          {renderData!.state.icon && <Slots.icon source={renderData.slotProps!.icon.source} />}
          {renderData!.state.content && <Slots.content />}
          {children}
        </Slots.stack>
      </Slots.root>
    );
  },
  slots: {
    root: View,
    stack: { slotType: View, filter: filterViewProps },
    icon: { slotType: Image as React.ComponentType<object>, filter: filterImageProps },
    content: Text
  },
  styles: {
    root: [backgroundColorTokens, borderTokens],
    stack: [],
    icon: [foregroundColorTokens],
    content: [textTokens, foregroundColorTokens]
  }
});

export default ContextualMenuItem;
