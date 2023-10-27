/** @jsxRuntime classic */
/** @jsx withSlots */
/** @jsxFrag */

import React from 'react';
import { View, Pressable } from 'react-native';
import type { ViewProps } from 'react-native';

import type { UseTokens } from '@fluentui-react-native/framework';
import { withSlots, compressible, useSlot, useFluentTheme, applyTokenLayers, mergeProps } from '@fluentui-react-native/framework';
import { IconV1 as Icon } from '@fluentui-react-native/icon';
import type { IconPropsV1 as IconProps } from '@fluentui-react-native/icon';
import type { PressablePropsExtended } from '@fluentui-react-native/interactive-hooks';
import type { TextProps } from '@fluentui-react-native/text';
import { Text } from '@fluentui-react-native/text';

import { useTabSlotProps } from './Tab.styling';
import { tabName } from './Tab.types';
import type { TabProps, TabState, TabTokens } from './Tab.types';
import { tabStates, useTabTokens } from './TabTokens';
import { useTab } from './useTab';
import { useTabAnimation } from './useTabAnimation';
import type { TabListState } from '../TabList/TabList.types';
import { TabListContext } from '../TabList/TabListContext';

const tabLookup = (layer: string, state: TabState, props: TabProps, tablistContext: TabListState): boolean => {
  return (
    state[layer] ||
    props[layer] ||
    tablistContext[layer] ||
    layer === tablistContext.appearance ||
    layer === tablistContext.size ||
    (layer === 'hasIcon' && props.icon)
  );
};

export const Tab = compressible<TabProps, TabTokens>((props: TabProps, useTokens: UseTokens<TabTokens>) => {
  const tablist = React.useContext(TabListContext);
  const tab = useTab(props);

  const theme = useFluentTheme();
  let [tokens, cache] = useTokens(theme);

  // Calculate component states to get the correct tokens here (this happens in useSlots for compose components)
  [tokens, cache] = applyTokenLayers(tokens, tabStates, cache, (layer) => tabLookup(layer, tab.state, tab.props, tablist));

  // Get styling props for each Tab slot
  const slotProps = useTabSlotProps(tab.props, tokens, theme, tablist);

  const rootProps = useTabAnimation(props, tablist, tokens, slotProps.root);

  const RootSlot = useSlot<PressablePropsExtended>(Pressable, rootProps);
  const StackSlot = useSlot<ViewProps>(View, slotProps.stack as ViewProps);
  const IndicatorContainerSlot = useSlot<ViewProps>(View, slotProps.indicatorContainer as ViewProps);
  const IndicatorSlot = useSlot<ViewProps>(View, slotProps.indicator as ViewProps);
  const ContentContainerSlot = useSlot<ViewProps>(View, slotProps.contentContainer as ViewProps);
  const ContentSlot = useSlot<TextProps>(Text, slotProps.content);
  const IconSlot = useSlot<IconProps>(Icon, slotProps.icon);

  return (final: TabProps, ...children: React.ReactNode[]) => {
    if (!tab.state) {
      return null;
    }

    // Get label for Tab to use if there's no accessibilityLabel prop passed in.
    let label = '';
    let hasChildren = false;
    React.Children.forEach(children, (child) => {
      if (child !== null) {
        hasChildren = true;
        if (typeof child === 'string') {
          label = child;
        }
      }
    });

    const { icon, tabKey, ...mergedProps } = mergeProps(tab.props, final, {
      accessibilityLabel: tab.props.accessibilityLabel || final.accessibilityLabel || label,
    });

    if (__DEV__ && !hasChildren && !icon) {
      console.warn('A Tab component must render content. Children, an icon, or both should be passed in.');
    }

    return (
      <RootSlot {...mergedProps}>
        <StackSlot>
          {icon && <IconSlot {...icon} />}
          {hasChildren && (
            <ContentContainerSlot>
              {React.Children.map(children, (child, i) =>
                typeof child === 'string' ? (
                  <ContentSlot accessible={false} key={i}>
                    {child}
                  </ContentSlot>
                ) : (
                  child
                ),
              )}
            </ContentContainerSlot>
          )}
        </StackSlot>
        <IndicatorContainerSlot>
          <IndicatorSlot />
        </IndicatorContainerSlot>
      </RootSlot>
    );
  };
}, useTabTokens);
Tab.displayName = tabName;

export default Tab;
