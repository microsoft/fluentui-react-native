import * as React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import {
  useAccessibilityLabelWarning,
  useOptionalSlot,
  usePressableState,
  useSlot,
  useToggleState,
} from '@fluentui-react-native/framework-base';

import { Icon } from '../../primitives/icon/icon';
import { semanticIconSources } from '../../common/iconSources';
import type { AccordionProps, AccordionState } from './accordion.types';

const defaultTitle = 'Section title';
const defaultLeadingIconSource = semanticIconSources.selectedCircle;
const defaultChevronSource = semanticIconSources.chevron;

/**
 * Creates the resolved Accordion state, accessibility, interaction, and slots.
 */
export function useAccordion_unstable(props: AccordionProps): AccordionState {
  const {
    accessibilityHint,
    accessibilityLabel,
    accessibilityState,
    bodyContent: bodyContentProp,
    defaultExpanded,
    expanded: expandedProp,
    focused: focusedProp,
    layout = 'chevronStart',
    leadingIcon: leadingIconProp,
    onExpandedChange,
    size = 'small',
    style: userStyle,
    title: titleProp,
    ...rootProps
  } = props;

  const expansion = useToggleState({ value: expandedProp, defaultValue: defaultExpanded, onChange: onExpandedChange });
  const resolvedExpanded = expansion.value;
  const bodyId = React.useId().replace(/:/g, '');

  useAccessibilityLabelWarning({
    accessibilityLabel,
    componentName: 'Accordion',
    requireLabel: titleProp === null,
    warning: 'Accordion: provide a meaningful title or accessibilityLabel for the header button.',
  });

  const toggleExpanded = expansion.activate;

  const themeState = useThemeState();
  const [headerProps, pressableState] = usePressableState({
    accessibilityControls: bodyId,
    accessibilityHint,
    accessibilityLabel,
    accessibilityRole: 'button',
    accessibilityState: {
      ...accessibilityState,
      expanded: resolvedExpanded,
    },
    accessible: true,
    'aria-controls': bodyId,
    'aria-expanded': resolvedExpanded,
    focusable: true,
    onPress: toggleExpanded,
  });

  const root = useSlot(View, {
    ...rootProps,
    accessible: false,
    style: userStyle,
  });
  const header = useSlot(Pressable, {
    ...headerProps,
    testID: 'accordion-header',
  });
  const title = useOptionalSlot(Text, titleProp, {
    defaultProps: {
      children: defaultTitle,
      testID: 'accordion-title',
    },
    renderByDefault: true,
  });
  const leadingIcon = useOptionalSlot(Icon, leadingIconProp, {
    defaultProps: {
      accessible: false,
      fontSource: defaultLeadingIconSource,
      height: 16,
      testID: 'accordion-leading-icon',
      width: 16,
    },
    renderByDefault: true,
  });
  const bodyContent = useOptionalSlot(View, bodyContentProp);
  const body = useSlot(View, {
    accessibilityElementsHidden: !resolvedExpanded,
    accessible: false,
    id: bodyId,
    importantForAccessibility: resolvedExpanded ? undefined : 'no-hide-descendants',
    testID: 'accordion-body',
  });
  const chevronContainer = useSlot(View, {
    accessible: false,
    testID: 'accordion-chevron',
  });
  const chevron = useSlot(Icon, {
    accessible: false,
    fontSource: defaultChevronSource,
    height: 16,
    testID: 'accordion-chevron-icon',
    width: 16,
  });

  return {
    root,
    header,
    title,
    leadingIcon,
    bodyContent,
    body,
    chevronContainer,
    chevron,
    layout,
    size,
    expanded: resolvedExpanded,
    userStyle,
    ...themeState,
    ...pressableState,
    focused: focusedProp ?? pressableState.focused,
  };
}
