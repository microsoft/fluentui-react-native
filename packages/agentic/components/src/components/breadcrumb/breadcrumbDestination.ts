import { useLayoutEffect } from 'react';
import { Platform } from 'react-native';
import { attachSlotProps, isSelfTargetEvent } from '@fluentui-react-native/framework-base';
import type { FocusKeyboardEvent } from '@fluentui-react-native/framework-base';
import { renderLink_unstable } from '../link/renderLink';
import { useLink_unstable } from '../link/useLink';
import { useLinkStyles_unstable } from '../link/useLinkStyles';
import { breadcrumbStyles } from './breadcrumb.styles';
import type { BreadcrumbAncestor, BreadcrumbState } from './breadcrumb.types';

export function BreadcrumbDestination({
  item,
  state,
  inPopover = false,
}: {
  item: BreadcrumbAncestor;
  state: BreadcrumbState;
  inPopover?: boolean;
}) {
  const { register, onLinkFocus, onLinkBlur, onOverflowKeys, onNavigate } = state;
  const nativeProps = {
    keyDownEvents: inPopover && String(Platform.OS) === 'win32' ? ['ArrowUp', 'ArrowDown'].map((key) => ({ key })) : undefined,
    onKeyDown: inPopover ? (event: FocusKeyboardEvent) => onOverflowKeys(item.key, event) : undefined,
    onFocus: (event: Parameters<typeof isSelfTargetEvent>[0]) => {
      if (isSelfTargetEvent(event)) onLinkFocus(item.key, inPopover);
    },
    onBlur: (event: Parameters<typeof isSelfTargetEvent>[0]) => {
      if (isSelfTargetEvent(event)) onLinkBlur(item.key, inPopover);
    },
  };
  const link = useLink_unstable({
    ...nativeProps,
    content: item.label,
    testID: item.testID,
    tooltip: inPopover ? undefined : item.label,
    onNavigate: () => onNavigate(item, inPopover),
    style: breadcrumbStyles.link,
  });
  useLayoutEffect(() => register(item.key, inPopover, link.focusTarget), [inPopover, item.key, link.focusTarget, register]);
  useLinkStyles_unstable(link);
  attachSlotProps(link.content, { style: state.layout.typography, numberOfLines: inPopover ? undefined : 1 });
  return renderLink_unstable(link);
}
