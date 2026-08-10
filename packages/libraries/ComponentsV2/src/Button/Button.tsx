import * as React from 'react';
import type { AccessibilityActionEvent, ColorValue, PressableStateCallbackType, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { InteractionEvent } from '@fluentui/react-native';
import { useKeyProps, usePressableState } from '@fluentui/react-native';
import { useFluentTheme } from '@fluentui-react-native/framework';
import { Path, Svg } from 'react-native-svg';

import { buttonSizeTokens, getButtonBorderRadius, getButtonColorTokens } from './Button.tokens';
import type {
  ButtonProps,
  ButtonIcon,
  CompoundButtonProps,
  MenuButtonProps,
  SplitButtonProps,
  ToggleButtonProps,
} from './Button.types';

type PressableRef = React.ElementRef<typeof Pressable>;
type ButtonStyle = ButtonProps['style'];

interface ButtonSurfaceProps extends ButtonProps {
  checked?: boolean;
  children?: React.ReactNode;
  endAdornment?: React.ReactNode;
  expanded?: boolean;
  isAccessible?: boolean;
  secondaryContent?: React.ReactNode;
}

function getAccessibleText(children: React.ReactNode): string | undefined {
  const values: string[] = [];
  React.Children.forEach(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      values.push(String(child));
    }
  });

  return values.length > 0 ? values.join(' ') : undefined;
}

function ChevronDown({ color, size }: { color: ColorValue | undefined; size: number }): React.ReactElement {
  return (
    <Svg height={size} viewBox="0 0 20 20" width={size}>
      <Path d="M4.22 7.47a.75.75 0 0 1 1.06 0L10 12.19l4.72-4.72a.75.75 0 1 1 1.06 1.06l-5.25 5.25a.75.75 0 0 1-1.06 0L4.22 8.53a.75.75 0 0 1 0-1.06Z" fill={color} />
    </Svg>
  );
}

function isButtonFontIcon(icon: ButtonIcon): icon is Extract<ButtonIcon, { fontSource: unknown }> {
  return typeof icon === 'object' && icon !== null && 'fontSource' in icon;
}

function ButtonIconContent({
  color,
  icon,
  size,
}: {
  color: ColorValue | undefined;
  icon: ButtonIcon;
  size: number;
}): React.ReactNode {
  if (isButtonFontIcon(icon)) {
    const { codepoint, fontFamily, fontSize } = icon.fontSource;
    return (
      <Text accessible={false} style={[styles.iconGlyph, { color, fontFamily, fontSize: fontSize ?? size, lineHeight: size }]}>
        {String.fromCodePoint(codepoint)}
      </Text>
    );
  }

  if (typeof icon === 'string' || typeof icon === 'number') {
    return (
      <Text accessible={false} style={[styles.iconGlyph, { color, fontSize: size, lineHeight: size }]}>
        {icon}
      </Text>
    );
  }

  return icon;
}

function mergePressableStyle(baseStyle: StyleProp<ViewStyle>, override: ButtonStyle | undefined): ButtonStyle {
  if (typeof override === 'function') {
    return (state: PressableStateCallbackType) => [baseStyle, override(state)];
  }

  return [baseStyle, override];
}

function ButtonSurface(
  {
    accessibilityActions,
    accessibilityLabel,
    accessibilityRole = 'button',
    accessibilityState,
    appearance = 'secondary',
    checked,
    children,
    disabled = false,
    disabledFocusable = false,
    endAdornment,
    expanded,
    focusable,
    icon,
    iconOnly,
    iconPosition = 'before',
    isAccessible = false,
    loading = false,
    onAccessibilityAction,
    onClick,
    secondaryContent,
    shape = 'rounded',
    size = 'medium',
    style,
    testID,
    ...rest
  }: ButtonSurfaceProps,
  ref: React.ForwardedRef<PressableRef>,
): React.ReactElement {
  const theme = useFluentTheme();
  const visualDisabled = disabled || disabledFocusable || loading;
  const canFocus = !disabled && !loading;
  const hasContent = children !== undefined && children !== null;
  const inferredIconOnly = iconOnly ?? (!hasContent && (!!icon || loading));
  const pressHandler = React.useCallback(
    (event: InteractionEvent) => {
      if (visualDisabled) {
        return;
      }
      onClick?.(event);
    },
    [onClick, visualDisabled],
  );
  const pressable = usePressableState({
    ...rest,
    disabled: disabled || loading,
    onPress: pressHandler,
  });
  const keyProps = useKeyProps(pressHandler, ' ');
  const mergedAccessibilityActions = [{ name: 'activate' as const }, ...(accessibilityActions ?? [])];
  const handleAccessibilityAction = React.useCallback(
    (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName.toLocaleLowerCase() === 'activate') {
        pressHandler(event);
      }
      onAccessibilityAction?.(event);
    },
    [onAccessibilityAction, pressHandler],
  );
  const colors = getButtonColorTokens(theme, appearance, {
    checked,
    disabled: visualDisabled,
    hovered: !!pressable.state.hovered,
    isAccessible,
    pressed: !!pressable.state.pressed,
  });
  const tokens = buttonSizeTokens[size];
  const resolvedStyle = typeof style === 'function' ? style({ pressed: !!pressable.state.pressed }) : style;
  const label = accessibilityLabel ?? getAccessibleText(children);
  const secondaryLabel = getAccessibleText(secondaryContent);
  const accessibleName = secondaryLabel && label ? `${label} ${secondaryLabel}` : label;
  const iconElement = !loading && icon ? (
    <View
      accessible={false}
      pointerEvents="none"
      style={[
        styles.icon,
        {
          marginLeft: inferredIconOnly ? 0 : iconPosition === 'after' ? 8 : 0,
          marginRight: inferredIconOnly ? 0 : iconPosition === 'before' ? 8 : 0,
        },
      ]}
    >
      <ButtonIconContent color={colors.foregroundColor} icon={icon} size={tokens.iconSize} />
    </View>
  ) : null;
  const content = hasContent ? (
    <View
      accessible={false}
      pointerEvents="none"
      style={[styles.contentContainer, secondaryContent ? styles.compoundContentContainer : undefined]}
    >
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text accessible={false} style={[styles.label, { color: colors.foregroundColor, fontSize: tokens.fontSize, lineHeight: tokens.lineHeight }]}>
          {children}
        </Text>
      ) : (
        children
      )}
      {secondaryContent ? (
        typeof secondaryContent === 'string' || typeof secondaryContent === 'number' ? (
          <Text
            accessible={false}
            style={[styles.secondaryLabel, { color: colors.foregroundColor, fontSize: Math.max(tokens.fontSize - 2, 12) }]}
          >
            {secondaryContent}
          </Text>
        ) : (
          secondaryContent
        )
      ) : null}
    </View>
  ) : null;

  return (
    <Pressable
      {...pressable.props}
      {...keyProps}
      accessibilityActions={mergedAccessibilityActions}
      accessibilityLabel={accessibleName}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        ...accessibilityState,
        disabled: visualDisabled,
        ...(loading || accessibilityState?.busy ? { busy: true } : {}),
        ...(checked === undefined ? {} : { checked }),
        ...(expanded === undefined ? {} : { expanded }),
      }}
      focusable={focusable ?? (disabledFocusable ? true : canFocus)}
      onAccessibilityAction={handleAccessibilityAction}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          borderRadius: getButtonBorderRadius(shape, size),
          minHeight: tokens.height,
          minWidth: inferredIconOnly ? tokens.height + (endAdornment ? 8 : 0) : tokens.minWidth,
          paddingHorizontal: inferredIconOnly ? 0 : tokens.paddingHorizontal,
          paddingVertical: inferredIconOnly ? 0 : tokens.paddingVertical,
          width: inferredIconOnly ? tokens.height + (endAdornment ? 8 : 0) : undefined,
        },
        resolvedStyle,
      ]}
      testID={testID}
    >
      {loading ? <ActivityIndicator accessible={false} color={colors.foregroundColor} size={tokens.iconSize} /> : null}
      {iconPosition === 'before' ? iconElement : null}
      {content}
      {iconPosition === 'after' ? iconElement : null}
      {endAdornment ? (
        <View
          accessible={false}
          pointerEvents="none"
          style={[styles.endAdornment, { marginLeft: inferredIconOnly ? 4 : hasContent || !!icon ? 8 : 0 }]}
        >
          {endAdornment}
        </View>
      ) : null}
      {pressable.state.focused && canFocus ? (
        <>
          <View
            accessible={false}
            focusable={false}
            pointerEvents="none"
            style={[styles.focusOuter, { borderColor: theme.colors.strokeFocus2, borderRadius: getButtonBorderRadius(shape, size) + 1 }]}
          />
          <View
            accessible={false}
            focusable={false}
            pointerEvents="none"
            style={[styles.focusInner, { borderColor: theme.colors.strokeFocus1, borderRadius: getButtonBorderRadius(shape, size) }]}
          />
        </>
      ) : null}
    </Pressable>
  );
}

const ForwardedButtonSurface = React.forwardRef<PressableRef, ButtonSurfaceProps>(ButtonSurface);

export const Button = React.forwardRef<PressableRef, ButtonProps>((props, ref) => <ForwardedButtonSurface {...props} ref={ref} />);
Button.displayName = 'Button';

export const CompoundButton = React.forwardRef<PressableRef, CompoundButtonProps>((props, ref) => (
  <ForwardedButtonSurface {...props} ref={ref} />
));
CompoundButton.displayName = 'CompoundButton';

export const MenuButton = React.forwardRef<PressableRef, MenuButtonProps>(
  ({ expanded = false, menuIcon, size = 'medium', ...props }, ref) => {
    const theme = useFluentTheme();
    const colors = getButtonColorTokens(theme, props.appearance ?? 'secondary', {
      disabled: !!props.disabled || !!props.disabledFocusable || !!props.loading,
    });
    const endAdornment = menuIcon ?? <ChevronDown color={colors.foregroundColor} size={buttonSizeTokens[size].iconSize} />;

    return (
      <ForwardedButtonSurface
        {...props}
        endAdornment={endAdornment}
        expanded={expanded}
        iconOnly={props.iconOnly ?? (!props.children && !props.icon)}
        ref={ref}
        size={size}
      />
    );
  },
);
MenuButton.displayName = 'MenuButton';

export function SplitButton({
  appearance = 'secondary',
  children,
  disabled = false,
  disabledFocusable = false,
  expanded = false,
  icon,
  menuButton,
  menuIcon,
  onClick,
  onMenuClick,
  primaryActionButton,
  shape = 'rounded',
  size = 'medium',
  style,
  testID,
  ...rest
}: SplitButtonProps): React.ReactElement {
  const primaryLabel = getAccessibleText(children);
  const primaryProps = primaryActionButton ?? {};
  const menuProps = menuButton ?? {};
  const menuLabel = menuProps.accessibilityLabel ?? (primaryLabel ? `More ${primaryLabel} options` : 'More options');
  const radius = getButtonBorderRadius(shape, size);
  const sharedProps = {
    appearance,
    disabled,
    disabledFocusable,
    shape,
    size,
  } satisfies Pick<ButtonProps, 'appearance' | 'disabled' | 'disabledFocusable' | 'shape' | 'size'>;
  const primaryStyle = mergePressableStyle(
    {
      borderBottomLeftRadius: radius,
      borderBottomRightRadius: 0,
      borderTopLeftRadius: radius,
      borderTopRightRadius: 0,
    },
    primaryProps.style,
  );
  const menuStyle = mergePressableStyle(
    {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: radius,
      borderLeftWidth: 0,
      borderTopLeftRadius: 0,
      borderTopRightRadius: radius,
      minWidth: buttonSizeTokens[size].height,
      paddingHorizontal: 0,
      width: buttonSizeTokens[size].height,
    },
    menuProps.style,
  );

  return (
    <View accessible={false} pointerEvents="box-none" style={[styles.splitRoot, style]} testID={testID}>
      <Button
        {...rest}
        {...sharedProps}
        {...primaryProps}
        icon={primaryProps.icon ?? icon}
        onClick={primaryProps.onClick ?? onClick}
        style={primaryStyle}
        testID={primaryProps.testID ?? (testID ? `${testID}-primary-action` : undefined)}
      >
        {primaryProps.iconOnly ? undefined : children}
      </Button>
      <MenuButton
        {...sharedProps}
        {...menuProps}
        accessibilityLabel={menuLabel}
        expanded={menuProps.expanded ?? expanded}
        menuIcon={menuProps.menuIcon ?? menuIcon}
        onClick={menuProps.onClick ?? onMenuClick}
        style={menuStyle}
        testID={menuProps.testID ?? (testID ? `${testID}-menu-action` : undefined)}
      />
    </View>
  );
}

export const ToggleButton = React.forwardRef<PressableRef, ToggleButtonProps>(
  ({ checked, defaultChecked = false, isAccessible = false, onCheckedChange, onClick, ...props }, ref) => {
    const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);
    const currentChecked = checked ?? uncontrolledChecked;
    const handleClick = React.useCallback(
      (event: InteractionEvent) => {
        if (props.disabled || props.disabledFocusable || props.loading) {
          return;
        }

        const nextChecked = !currentChecked;
        if (checked === undefined) {
          setUncontrolledChecked(nextChecked);
        }
        onCheckedChange?.(event, { checked: nextChecked });
        onClick?.(event);
      },
      [checked, currentChecked, onCheckedChange, onClick, props.disabled, props.disabledFocusable, props.loading],
    );

    return (
      <ForwardedButtonSurface
        {...props}
        checked={currentChecked}
        isAccessible={isAccessible}
        onClick={handleClick}
        ref={ref}
      />
    );
  },
);
ToggleButton.displayName = 'ToggleButton';

const styles = StyleSheet.create({
  compoundContentContainer: {
    alignItems: 'flex-start',
  },
  contentContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    flexShrink: 1,
  },
  endAdornment: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusInner: {
    borderWidth: 1,
    bottom: 1,
    left: 1,
    position: 'absolute',
    right: 1,
    top: 1,
  },
  focusOuter: {
    borderWidth: 2,
    bottom: -2,
    left: -2,
    position: 'absolute',
    right: -2,
    top: -2,
  },
  icon: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  iconGlyph: {
    fontWeight: '400',
    textAlign: 'center',
  } satisfies TextStyle,
  label: {
    flexShrink: 1,
    fontFamily: 'Segoe UI',
    fontWeight: '600',
    textAlign: 'center',
  } satisfies TextStyle,
  root: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    maxWidth: '100%',
    overflow: 'visible',
    position: 'relative',
  },
  secondaryLabel: {
    flexShrink: 1,
    fontFamily: 'Segoe UI',
    fontWeight: '400',
    lineHeight: 16,
    marginTop: 2,
  } satisfies TextStyle,
  splitRoot: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    maxWidth: '100%',
  },
});
