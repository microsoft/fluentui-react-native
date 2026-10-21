/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';

import { RootInputBoundary } from '@fluentui-react-native/design';
import type { FocusKeyboardEvent } from '@fluentui-react-native/framework-base';
import type { CalloutDismissReason, CalloutHandle, CalloutPresentation, NativeViewTarget } from '@fluentui-react-native/native-core/macos';

import type {
  ListboxItemOptionAction,
  ListboxItemOptionBinding,
  ListboxItemOptionRegistration,
} from '../listbox-item/listboxItemOptionContext';
import { ListboxItemOptionContext } from '../listbox-item/listboxItemOptionContext';
import type { DropdownPresence } from './dropdownController';
import type { DropdownOptions } from './dropdownOptions';
import type { DropdownListboxProps } from './dropdown.types';

// Room for native focus rings, which draw outside an option's bounds.
const focusRingOutset = 4;

// The widest layout the popup may take, so the list is not capped at the width of the Dropdown's container.
const popupLayoutWidth = 4096;

// The option area's height cap, about eight medium options.
export const dropdownListMaxHeight = 320;

const styles = StyleSheet.create({
  host: {
    height: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: popupLayoutWidth,
  },
  // Yoga measures a scrolling row's children at their max-content width, so the list takes its widest option's natural
  // width instead of filling the window; options then stretch to that width.
  fit: {
    flexDirection: 'row',
    margin: -focusRingOutset,
    overflow: 'scroll',
    padding: focusRingOutset,
  },
  scroll: {
    flexGrow: 1,
    maxHeight: dropdownListMaxHeight,
  },
});

const firstDefined = (...values: unknown[]) => {
  const value = values.find((candidate) => candidate !== undefined);
  return typeof value === 'number' ? value : 0;
};

/** The surface's horizontal padding and border, which sit outside the width floor. */
function horizontalChrome(style: StyleProp<ViewStyle>): number {
  const s = StyleSheet.flatten(style) ?? {};
  return (
    firstDefined(s.paddingStart, s.paddingLeft, s.paddingHorizontal, s.padding) +
    firstDefined(s.paddingEnd, s.paddingRight, s.paddingHorizontal, s.padding) +
    firstDefined(s.borderStartWidth, s.borderLeftWidth, s.borderWidth) +
    firstDefined(s.borderEndWidth, s.borderRightWidth, s.borderWidth)
  );
}

export interface DropdownPopupProps extends DropdownPresence {
  multiselect: boolean;
  options: DropdownOptions;
  /** The current selection, which decides the entry option. */
  selectedOptions: readonly string[];
  /** The option multiple mode toggled most recently. */
  lastToggled?: string;
  /** Activates an enabled option: commits it in single mode and toggles it in multiple mode. */
  onOptionActivate(value: string): void;
  /** Applies a select, add, or remove accessibility action to an enabled option. */
  onOptionSelectionAction(value: string, action: ListboxItemOptionAction): void;
  listbox?: DropdownListboxProps;
  /** The accessible name used when the listbox has none. */
  label?: string;
  /** The trigger's width, which the surface never narrows below. */
  triggerWidth?: number;
  surfaceStyle?: StyleProp<ViewStyle>;
  gap?: number;
  children: React.ReactNode;
}

function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (instance: T | null) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === 'function') {
        return ref(instance);
      }
      if (ref) {
        (ref as React.RefObject<T | null>).current = instance;
      }
      return undefined;
    });
    return () => {
      cleanups.forEach((cleanup, index) => {
        const ref = refs[index];
        if (typeof cleanup === 'function') {
          cleanup();
        } else if (typeof ref === 'function') {
          ref(null);
        } else if (ref) {
          (ref as React.RefObject<T | null>).current = null;
        }
      });
    };
  };
}

type Measurable = { measureLayout(relativeTo: object, onSuccess: (x: number, y: number, width: number, height: number) => void): void };

function isMeasurable(instance: object | null): instance is Measurable {
  return instance !== null && typeof (instance as Partial<Measurable>).measureLayout === 'function';
}

/**
 * The Dropdown list: the native Callout, its surface, the scroll container, the vertical FocusZone, and the policy for
 * the bound options it hosts (entry focus, Home and End, hover, activation, and the selection actions).
 */
export function DropdownPopup(props: DropdownPopupProps) {
  const { anchorTarget, children, gap = 0, host, listbox, multiselect, open, options, presentationKey, selectedOptions } = props;

  const callout = React.useRef<CalloutHandle>(null);
  const surfaceTarget = host.useNativeViewTarget();
  const latest = React.useRef(props);
  React.useLayoutEffect(() => {
    latest.current = props;
  });

  const registrations = React.useRef(new Map<string, ListboxItemOptionRegistration>());
  const presentation = React.useRef<CalloutPresentation | null>(null);
  const focusedValue = React.useRef<string | null>(null);
  const scroll = React.useRef<ScrollView>(null);
  const scrollContent = React.useRef<View>(null);
  const scrollOffset = React.useRef(0);
  const viewportHeight = React.useRef(0);

  // Registered, enabled options in option order.
  const enabledOptions = React.useCallback(
    () =>
      latest.current.options.list
        .map((option) => registrations.current.get(option.value))
        .filter((registration): registration is ListboxItemOptionRegistration => registration !== undefined && !registration.disabled),
    [],
  );

  const findEntryOption = React.useCallback((): ListboxItemOptionRegistration | undefined => {
    const { entry, lastToggled, multiselect: multiple, options: current, selectedOptions: selection } = latest.current;
    const enabled = enabledOptions();
    const selected = new Set(selection);
    const isEnabledSelected = (value: string | undefined) =>
      value !== undefined && selected.has(value) ? enabled.find((registration) => registration.value === value) : undefined;
    if (multiple) {
      const recent = isEnabledSelected(lastToggled);
      if (recent) {
        return recent;
      }
      const first = enabled.find((registration) => selected.has(registration.value));
      if (first) {
        return first;
      }
    } else {
      // Only the first selected value that matches an option counts in single mode.
      const value = selection.find((candidate) => current.byValue.has(candidate));
      const option = isEnabledSelected(value);
      if (option) {
        return option;
      }
    }
    return entry === 'last' ? enabled[enabled.length - 1] : enabled[0];
  }, [enabledOptions]);

  const focusEntry = React.useCallback(
    (current: CalloutPresentation) => {
      const api = callout.current;
      if (!api) {
        return;
      }
      const option = findEntryOption();
      const target = (option?.nativeTarget ?? surfaceTarget.target) as NativeViewTarget;
      void api.requestFocus(current, target).then(({ status }) => {
        if (status === 'confirmed') {
          latest.current.onFocusHeld();
        }
      });
    },
    [findEntryOption, surfaceTarget],
  );

  const { entryKey } = props;
  const appliedEntryKey = React.useRef(entryKey);
  React.useEffect(() => {
    if (entryKey === appliedEntryKey.current) {
      return;
    }
    appliedEntryKey.current = entryKey;
    const current = presentation.current;
    if (current && callout.current?.getPresentation() === current) {
      focusEntry(current);
    }
  }, [entryKey, focusEntry]);

  const onReady = React.useCallback(
    ({ presentation: current }: { presentation: CalloutPresentation }) => {
      presentation.current = current;
      appliedEntryKey.current = latest.current.entryKey;
      focusEntry(current);
    },
    [focusEntry],
  );
  const onDismissed = React.useCallback(({ reason }: { reason: CalloutDismissReason }) => {
    presentation.current = null;
    focusedValue.current = null;
    scrollOffset.current = 0;
    latest.current.onDismissed(reason);
  }, []);

  const scrollIntoView = React.useCallback((value: string) => {
    const instance = registrations.current.get(value)?.getHostInstance() ?? null;
    const content = scrollContent.current;
    if (!content || !isMeasurable(instance)) {
      return;
    }
    instance.measureLayout(content, (_x, y, _width, height) => {
      const top = scrollOffset.current;
      const viewport = viewportHeight.current;
      if (viewport <= 0) {
        return;
      }
      if (y < top) {
        scroll.current?.scrollTo({ y, animated: false });
      } else if (y + height > top + viewport) {
        scroll.current?.scrollTo({ y: y + height - viewport, animated: false });
      }
    });
  }, []);

  const focusEdge = React.useCallback(
    (edge: 'first' | 'last') => {
      const enabled = enabledOptions();
      (edge === 'first' ? enabled[0] : enabled[enabled.length - 1])?.focusTarget.requestFocus('keyboard');
    },
    [enabledOptions],
  );

  const binding = React.useMemo<ListboxItemOptionBinding>(
    () => ({
      multiselect,
      setSize: options.list.length,
      isSelected: (value) => selectedOptions.includes(value),
      getPosition: (value) => options.byValue.get(value)?.position,
      useNativeTarget: host.useNativeViewTarget as ListboxItemOptionBinding['useNativeTarget'],
      register: (option) => {
        // A repeated value keeps its first option.
        if (registrations.current.has(option.value)) {
          return () => undefined;
        }
        registrations.current.set(option.value, option);
        return () => {
          if (registrations.current.get(option.value) === option) {
            registrations.current.delete(option.value);
          }
        };
      },
      onOptionFocus: (value) => {
        focusedValue.current = value;
        latest.current.onFocusHeld();
        scrollIntoView(value);
      },
      onOptionBlur: (value) => {
        if (focusedValue.current === value) {
          focusedValue.current = null;
        }
      },
      onOptionHoverIn: (value) => {
        // Hot tracking: while the list holds focus, the hovered enabled option takes it.
        const registration = registrations.current.get(value);
        if (focusedValue.current !== null && focusedValue.current !== value && registration && !registration.disabled) {
          registration.focusTarget.requestFocus('pointer');
        }
      },
      onOptionKeyDown: (_value, event: FocusKeyboardEvent) => {
        const native = event.nativeEvent;
        if (native.altKey || native.ctrlKey || native.metaKey || native.shiftKey) {
          return;
        }
        if (native.key === 'Home' || native.key === 'End') {
          focusEdge(native.key === 'Home' ? 'first' : 'last');
        }
      },
      onOptionPress: (value) => {
        if (registrations.current.get(value)?.disabled === false) {
          latest.current.onOptionActivate(value);
        }
      },
      onOptionAction: (value, action) => {
        if (registrations.current.get(value)?.disabled === false) {
          latest.current.onOptionSelectionAction(value, action);
        }
      },
    }),
    [focusEdge, host, multiselect, options, scrollIntoView, selectedOptions],
  );

  const enabledCount = options.list.filter((option) => !option.disabled).length;
  const { ref: listboxRef, style: listboxStyle, ...listboxProps } = listbox ?? {};
  const content = {
    accessible: true,
    role: 'list' as const,
    accessibilityLabel: listboxProps.accessibilityLabel ?? props.label,
    ...listboxProps,
    accessibilityState: { ...listboxProps.accessibilityState, multiselectable: multiselect, required: false },
    enableFocusRing: false,
    // The surface is a focus stop only when no option can take focus.
    focusable: enabledCount === 0,
    ref: composeRefs<React.ComponentRef<typeof View>>(listboxRef, surfaceTarget.ref),
    style: [props.surfaceStyle, listboxStyle],
  };
  // Windows lays the portal content out as a layout root, which replaces the root's own min and max dimensions with the
  // portal constraints, so the trigger-width floor is a zero-height child inside the surface's padding and border.
  const floorWidth = props.triggerWidth === undefined ? undefined : Math.max(0, props.triggerWidth - horizontalChrome(content.style));

  const onScroll = React.useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.current = event.nativeEvent.contentOffset.y;
  }, []);
  // macOS Paper insets the scroll content by the width and height of any legacy scrollers, even while they are hidden,
  // so the list requests no horizontal scroller and a vertical one only while its options overflow the viewport.
  const [extent, setExtent] = React.useState({ content: 0, viewport: 0 });
  const onScrollLayout = React.useCallback((event: LayoutChangeEvent) => {
    const viewport = event.nativeEvent.layout.height;
    viewportHeight.current = viewport;
    setExtent((current) => (current.viewport === viewport ? current : { ...current, viewport }));
  }, []);
  const onContentSizeChange = React.useCallback((_width: number, content: number) => {
    setExtent((current) => (current.content === content ? current : { ...current, content }));
  }, []);
  const overflows = extent.viewport > 0 && extent.content > extent.viewport + 0.5;

  const { Callout, FocusZone } = host;
  return (
    <ListboxItemOptionContext.Provider value={binding}>
      <View pointerEvents="box-none" style={styles.host}>
        <Callout
          ref={callout}
          open={open}
          presentationKey={presentationKey}
          anchor={{ kind: 'view', target: anchorTarget }}
          placement={{ side: 'bottom', align: 'start', gap }}
          tabNavigation="continue"
          content={content}
          onReady={onReady}
          onDismissed={onDismissed}
        >
          {floorWidth !== undefined && <View pointerEvents="none" style={{ height: 0, width: floorWidth }} />}
          <RootInputBoundary style={styles.fit}>
            <ScrollView
              ref={scroll}
              style={styles.scroll}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={overflows}
              onContentSizeChange={onContentSizeChange}
              onLayout={onScrollLayout}
              onScroll={onScroll}
              scrollEventThrottle={16}
            >
              <View ref={scrollContent}>
                <FocusZone direction="vertical">{children}</FocusZone>
              </View>
            </ScrollView>
          </RootInputBoundary>
        </Callout>
      </View>
    </ListboxItemOptionContext.Provider>
  );
}
