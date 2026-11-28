import { useLayoutEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useControllableValue, useFocusTarget, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { semanticIconSources } from '../../common/iconSources';
import { Button } from '../button/button';
import { commandPressProps } from '../button/commandPress';
import { Popover } from '../popover/popover';
import type { PopoverOpenChangeData } from '../popover/popover.types';
import { Text } from '../text/text';
import type { TeachingPopoverProps, TeachingPopoverState } from './teaching-popover.types';

export function useTeachingPopover_unstable({
  title,
  children,
  image,
  steps = [],
  step,
  defaultStep,
  onStepChange,
  formatStep,
  nextLabel,
  backLabel,
  closeLabel,
  primaryAction,
  secondaryAction,
  onFinish,
  open,
  defaultOpen = false,
  onOpenChange,
  surface,
  ...rootProps
}: TeachingPopoverProps): TeachingPopoverState {
  const [presented = false, setPresented] = useControllableValue(open, defaultOpen);
  const [key, setKey] = useControllableValue(step, defaultStep ?? steps[0]?.key);
  const index = Math.max(
    0,
    steps.findIndex((entry) => entry.key === key),
  );
  const current = steps[index];
  const label = current?.title.trim() ? current.title : title;
  const primaryFocus = useFocusTarget(true);
  const secondaryFocus = useFocusTarget(true);
  const closeFocus = useFocusTarget(true);
  const [pendingFocus, setPendingFocus] = useState<{ key: string; from: 'primary' | 'secondary' }>();
  const changePresence = (next: boolean, data: PopoverOpenChangeData) => {
    if (next === presented) return;
    setPresented(next);
    onOpenChange?.(next, data);
  };
  const close = () => changePresence(false, { reason: 'dismiss' });
  const go = (reason: 'next' | 'back') => {
    const next = steps[index + (reason === 'next' ? 1 : -1)];
    if (!next || next.key === current?.key) return;
    const from = reason === 'next' ? primaryFocus : secondaryFocus;
    if (from.focusTarget.getSnapshot().focused) {
      setPendingFocus({ key: next.key, from: reason === 'next' ? 'primary' : 'secondary' });
    }
    setKey(next.key);
    onStepChange?.(next.key, { reason });
  };
  const primary =
    index < steps.length - 1
      ? nextLabel?.trim()
        ? { label: nextLabel, onPress: () => go('next') }
        : undefined
      : primaryAction?.label.trim()
        ? {
            label: primaryAction.label,
            onPress: () => {
              primaryAction.onPress();
              onFinish?.();
              close();
            },
          }
        : undefined;
  const secondary =
    index > 0 && backLabel?.trim()
      ? { label: backLabel, onPress: () => go('back') }
      : secondaryAction?.label.trim()
        ? secondaryAction
        : undefined;
  const media = current?.image ?? image;
  const progress = steps.length > 1 ? formatStep?.(index + 1, steps.length) : undefined;
  useLayoutEffect(() => {
    if (!pendingFocus) return;
    setPendingFocus(undefined);
    if (!presented || pendingFocus.key !== current?.key) return;
    const source = pendingFocus.from === 'primary' ? primaryFocus.focusTarget : secondaryFocus.focusTarget;
    if (source.current) return;
    const destination = [primaryFocus.focusTarget, secondaryFocus.focusTarget, closeFocus.focusTarget].find(
      (candidate) => candidate.current,
    );
    destination?.requestFocus('keyboard');
  }, [closeFocus.focusTarget, current?.key, pendingFocus, presented, primaryFocus.focusTarget, secondaryFocus.focusTarget]);
  return {
    ...useThemeState(),
    children,
    label,
    stepKey: current?.key,
    stepAnnouncement: progress ? `${label}. ${progress}` : label,
    root: useSlot(Popover, {
      ...rootProps,
      surface: { ...surface, accessibilityLabel: label },
      open: presented,
      onOpenChange: changePresence,
    }),
    content: useSlot(View, {}),
    header: useSlot(View, {}),
    title: useSlot(Text, { ...hiddenFromAccessibilityProps, children: label }),
    body: useOptionalSlot(Text, current?.body ? { children: current.body } : null),
    image: useOptionalSlot(Image, media ? { source: media, resizeMode: 'cover', ...hiddenFromAccessibilityProps } : null),
    footer: useOptionalSlot(View, primary || secondary || progress ? {} : null),
    progress: useOptionalSlot(Text, progress ? { children: progress } : null),
    close: useOptionalSlot(
      Button,
      closeLabel?.trim()
        ? {
            ...commandPressProps(close, false),
            ref: closeFocus.focusTargetRef,
            onFocus: closeFocus.onFocus,
            onBlur: closeFocus.onBlur,
            accessibilityLabel: closeLabel,
            appearance: 'subtle',
            size: 'small',
            leadingIcon: { ...hiddenFromAccessibilityProps, fontSource: semanticIconSources.dismiss },
          }
        : null,
    ),
    primary: useOptionalSlot(
      Button,
      primary
        ? {
            ...commandPressProps(primary.onPress, false),
            ref: primaryFocus.focusTargetRef,
            onFocus: primaryFocus.onFocus,
            onBlur: primaryFocus.onBlur,
            content: primary.label,
            appearance: 'primary',
          }
        : null,
    ),
    secondary: useOptionalSlot(
      Button,
      secondary
        ? {
            ...commandPressProps(secondary.onPress, false),
            ref: secondaryFocus.focusTargetRef,
            onFocus: secondaryFocus.onFocus,
            onBlur: secondaryFocus.onBlur,
            content: secondary.label,
          }
        : null,
    ),
  };
}
