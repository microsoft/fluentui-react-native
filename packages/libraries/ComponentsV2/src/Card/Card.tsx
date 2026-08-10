import * as React from 'react';
import type {
  AccessibilityActionEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useKeyProps, usePressableState } from '@fluentui/react-native';
import { useFluentTheme } from '@fluentui-react-native/framework';

import {
  cardShadow2,
  cardShadow4,
  cardShadow8,
  cardSizeTokens,
  getCardColors,
} from './Card.tokens';
import type {
  CardFooterProps,
  CardHeaderProps,
  CardInteractionEvent,
  CardPreviewProps,
  CardProps,
} from './Card.types';

interface CardContextValue {
  orientation: NonNullable<CardProps['orientation']>;
  previewPadding: number;
  setSelectableLabel: (label: string | undefined) => void;
}

interface CardPreviewPosition {
  first: boolean;
  last: boolean;
}

interface InternalCardPreviewProps extends CardPreviewProps {
  __cardPreviewPosition?: CardPreviewPosition;
}

const CardContext = React.createContext<CardContextValue | undefined>(undefined);

function isCardInteractive(props: CardProps): boolean {
  return !!(
    props.onClick ||
    props.onLongPress ||
    props.onPress ||
    props.onPressIn ||
    props.onPressOut
  );
}

function isSelectable(props: CardProps): boolean {
  return props.defaultSelected !== undefined || props.onSelectionChange !== undefined || props.selected !== undefined;
}

function getShadow(appearance: NonNullable<CardProps['appearance']>, disabled: boolean, hovered: boolean): ViewStyle | undefined {
  if (disabled) {
    return cardShadow2;
  }
  if (appearance === 'filled' || appearance === 'filled-alternative') {
    return hovered ? cardShadow8 : cardShadow4;
  }
  return undefined;
}

export const Card = React.forwardRef<React.ElementRef<typeof Pressable>, CardProps>((props, ref) => {
  const {
    accessibilityActions,
    accessibilityLabel,
    accessibilityRole,
    accessibilityState,
    accessible,
    appearance = 'filled',
    children,
    defaultSelected = false,
    disabled = false,
    floatingAction,
    focusMode,
    focusable,
    onAccessibilityAction,
    onClick,
    onPress,
    onSelectionChange,
    selected,
    size = 'medium',
    style,
    testID,
    orientation = 'vertical',
    ...rest
  } = props;
  const theme = useFluentTheme();
  const selectable = isSelectable(props);
  const interactive = !disabled && isCardInteractive(props);
  const effectiveFocusMode = focusMode ?? (interactive ? 'no-tab' : 'off');
  const [uncontrolledSelected, setUncontrolledSelected] = React.useState(defaultSelected);
  const currentSelected = selected ?? uncontrolledSelected;
  const [headerLabel, setHeaderLabel] = React.useState<string | undefined>();
  const sizeTokens = cardSizeTokens[size];

  const requestSelection = React.useCallback(
    (event: CardInteractionEvent) => {
      if (!selectable || disabled) {
        return;
      }

      const nextSelected = !currentSelected;
      if (selected === undefined) {
        setUncontrolledSelected(nextSelected);
      }
      onSelectionChange?.(event, { selected: nextSelected });
    },
    [currentSelected, disabled, onSelectionChange, selectable, selected],
  );

  const handlePress = React.useCallback(
    (event: CardInteractionEvent) => {
      if (disabled) {
        return;
      }

      requestSelection(event);
      onPress?.(event as Parameters<NonNullable<CardProps['onPress']>>[0]);
      onClick?.(event as Parameters<NonNullable<CardProps['onClick']>>[0]);
    },
    [disabled, onClick, onPress, requestSelection],
  );

  const handleAccessibilityAction = React.useCallback(
    (event: AccessibilityActionEvent) => {
      const actionName = event.nativeEvent.actionName.toLocaleLowerCase();
      if ((actionName === 'activate' || actionName === 'toggle') && !disabled) {
        handlePress(event);
      }
      onAccessibilityAction?.(event);
    },
    [disabled, handlePress, onAccessibilityAction],
  );

  const pressable = usePressableState({
    ...rest,
    disabled,
    onPress: handlePress,
  });
  const keyProps = useKeyProps(
    event => handlePress(event as CardInteractionEvent),
    ' ',
    'Enter',
  );
  const supportsPressable = interactive || selectable || effectiveFocusMode !== 'off';
  const activeState = (interactive || selectable) && !disabled;
  const colors = getCardColors(theme, appearance, {
    disabled,
    hovered: activeState && !!pressable.state.hovered,
    pressed: activeState && !!pressable.state.pressed,
    selected: currentSelected,
  });
  const resolvedStyle =
    typeof style === 'function' ? style({ pressed: !!pressable.state.pressed }) : (style as StyleProp<ViewStyle>);
  const rootVisualStyle: ViewStyle = {
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    borderRadius: sizeTokens.borderRadius,
    borderWidth: 1,
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    gap: sizeTokens.padding,
    padding: sizeTokens.padding,
  };
  const shadowStyle = getShadow(appearance, disabled, activeState && !!pressable.state.hovered);
  const rootStyle: StyleProp<ViewStyle> = [
    styles.root,
    rootVisualStyle,
    ...(shadowStyle ? [shadowStyle] : []),
    ...(resolvedStyle ? [resolvedStyle] : []),
  ];
  const cardAccessibilityLabel = accessibilityLabel ?? (selectable ? headerLabel : undefined);
  const cardAccessibilityState = selectable
    ? { ...accessibilityState, checked: currentSelected, disabled }
    : disabled
      ? { ...accessibilityState, disabled: true }
      : accessibilityState;
  const mergedAccessibilityActions = selectable
    ? [{ name: 'toggle' as const }, ...(accessibilityActions ?? [])]
    : interactive
      ? [{ name: 'activate' as const }, ...(accessibilityActions ?? [])]
      : accessibilityActions;
  const context = React.useMemo<CardContextValue>(
    () => ({
      orientation,
      previewPadding: sizeTokens.padding,
      setSelectableLabel: setHeaderLabel,
    }),
    [orientation, sizeTokens.padding],
  );
  const content = (
    <CardContext.Provider value={context}>
      {withPreviewPositions(children)}
      {floatingAction ? (
        <View pointerEvents="box-none" style={styles.floatingAction} testID={testID ? `${testID}-floating-action` : undefined}>
          {renderNativeContent(floatingAction)}
        </View>
      ) : null}
      {pressable.state.focused && !disabled ? (
        <View
          accessible={false}
          pointerEvents="none"
          style={[styles.focusRing, { borderColor: theme.colors.strokeFocus2 ?? '#000000' }]}
          testID={testID ? `${testID}-focus-ring` : undefined}
        />
      ) : null}
    </CardContext.Provider>
  );

  if (!supportsPressable) {
    return (
      <View
        {...rest}
        accessibilityLabel={cardAccessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityState={cardAccessibilityState}
        accessible={accessible ?? disabled}
        ref={ref}
        style={rootStyle}
        testID={testID}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      {...pressable.props}
      {...keyProps}
      accessibilityActions={mergedAccessibilityActions}
      accessibilityLabel={cardAccessibilityLabel}
      accessibilityRole={accessibilityRole ?? (selectable ? 'checkbox' : interactive ? 'button' : undefined)}
      accessibilityState={cardAccessibilityState}
      accessible={accessible ?? true}
      focusable={focusable ?? (!disabled && (selectable || effectiveFocusMode !== 'off'))}
      onAccessibilityAction={handleAccessibilityAction}
      ref={ref}
      style={rootStyle}
      testID={testID}
    >
      {content}
    </Pressable>
  );
});

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<View, CardHeaderProps>((props, ref) => {
  const {
    action,
    children,
    description,
    header,
    image,
    style,
    testID,
    accessibilityLabel,
    ...rest
  } = props;
  const card = React.useContext(CardContext);
  const headerContent = header ?? children;
  const inferredLabel =
    typeof accessibilityLabel === 'string'
      ? accessibilityLabel
      : typeof headerContent === 'string' || typeof headerContent === 'number'
        ? String(headerContent)
        : undefined;

  React.useEffect(() => {
    card?.setSelectableLabel(inferredLabel);
    return () => card?.setSelectableLabel(undefined);
  }, [card, inferredLabel]);

  return (
    <View
      {...rest}
      accessibilityLabel={accessibilityLabel}
      ref={ref}
      style={[styles.header, description !== undefined && description !== null ? styles.headerWithDescription : styles.headerSingleLine, style]}
      testID={testID}
    >
      {image !== undefined && image !== null ? (
        <View accessible={false} style={styles.headerImage} testID={testID ? `${testID}-image` : undefined}>
          {renderNativeContent(image)}
        </View>
      ) : null}
      <View style={styles.headerContent}>
        {headerContent !== undefined && headerContent !== null ? (
          <View style={styles.headerTitle} testID={testID ? `${testID}-header` : undefined}>
            {renderNativeContent(headerContent)}
          </View>
        ) : null}
        {description !== undefined && description !== null ? (
          <View style={styles.headerDescription} testID={testID ? `${testID}-description` : undefined}>
            {renderNativeContent(description)}
          </View>
        ) : null}
      </View>
      {action !== undefined && action !== null ? (
        <View style={styles.headerAction} testID={testID ? `${testID}-action` : undefined}>
          {renderNativeContent(action)}
        </View>
      ) : null}
    </View>
  );
});

CardHeader.displayName = 'CardHeader';

export const CardFooter = React.forwardRef<View, CardFooterProps>((props, ref) => {
  const { action, children, style, testID, ...rest } = props;

  return (
    <View {...rest} ref={ref} style={[styles.footer, style]} testID={testID}>
      {renderNativeContent(children)}
      {action !== undefined && action !== null ? (
        <View style={styles.footerAction} testID={testID ? `${testID}-action` : undefined}>
          {renderNativeContent(action)}
        </View>
      ) : null}
    </View>
  );
});

CardFooter.displayName = 'CardFooter';

const CardPreviewImpl = React.forwardRef<View, InternalCardPreviewProps>((props, ref) => {
  const { __cardPreviewPosition, children, logo, style, testID, ...rest } = props;
  const card = React.useContext(CardContext);
  const padding = card?.previewPadding ?? 0;
  const orientation = card?.orientation ?? 'vertical';
  const position = __cardPreviewPosition ?? { first: false, last: false };
  const bleedStyle: ViewStyle =
    orientation === 'horizontal'
      ? {
          marginBottom: -padding,
          marginLeft: position.first ? -padding : 0,
          marginRight: position.last ? -padding : 0,
          marginTop: -padding,
        }
      : {
          marginBottom: position.last ? -padding : 0,
          marginLeft: -padding,
          marginRight: -padding,
          marginTop: position.first ? -padding : 0,
        };

  return (
    <View {...rest} ref={ref} style={[styles.preview, bleedStyle, style]} testID={testID}>
      {renderNativeContent(children)}
      {logo !== undefined && logo !== null ? (
        <View accessible={false} pointerEvents="none" style={styles.previewLogo} testID={testID ? `${testID}-logo` : undefined}>
          {renderNativeContent(logo)}
        </View>
      ) : null}
    </View>
  );
});

CardPreviewImpl.displayName = 'CardPreview';

export const CardPreview = CardPreviewImpl as React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CardPreviewProps> & React.RefAttributes<View>
>;

function withPreviewPositions(children: React.ReactNode): React.ReactNode {
  const directChildren = React.Children.toArray(children);

  return directChildren.map((child, index) => {
    if (typeof child === 'string' || typeof child === 'number') {
      return (
        <Text key={`card-content-${index}`} style={styles.text}>
          {child}
        </Text>
      );
    }

    if (!React.isValidElement<InternalCardPreviewProps>(child) || child.type !== CardPreview) {
      return child;
    }

    return React.cloneElement(child, {
      __cardPreviewPosition: {
        first: index === 0,
        last: index === directChildren.length - 1,
      },
    });
  });
}

function renderNativeContent(content: React.ReactNode): React.ReactNode {
  return React.Children.map(content, child =>
    typeof child === 'string' || typeof child === 'number' ? <Text style={styles.text}>{child}</Text> : child,
  );
}

const styles = StyleSheet.create({
  floatingAction: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 2,
  },
  focusRing: {
    borderRadius: 3,
    borderWidth: 2,
    bottom: 1,
    left: 1,
    position: 'absolute',
    right: 1,
    top: 1,
    zIndex: 3,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    flexShrink: 1,
    gap: 12,
    minWidth: 0,
  },
  footerAction: {
    alignItems: 'flex-end',
    flexGrow: 1,
    flexShrink: 0,
  },
  header: {
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    flexShrink: 1,
    minWidth: 0,
  },
  headerAction: {
    alignSelf: 'center',
    flexShrink: 0,
    marginLeft: 12,
  },
  headerContent: {
    flexBasis: 80,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  headerDescription: {
    flexShrink: 1,
    marginTop: 2,
  },
  headerImage: {
    alignSelf: 'center',
    flexShrink: 0,
    marginRight: 12,
  },
  headerSingleLine: {
    alignItems: 'center',
  },
  headerTitle: {
    flexShrink: 1,
  },
  headerWithDescription: {
    alignItems: 'stretch',
  },
  preview: {
    alignSelf: 'stretch',
    flexShrink: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  previewLogo: {
    alignItems: 'center',
    bottom: 12,
    height: 32,
    justifyContent: 'center',
    left: 12,
    overflow: 'hidden',
    position: 'absolute',
    width: 32,
  },
  root: {
    minWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  text: {
    flexShrink: 1,
    fontFamily: 'Segoe UI',
    fontSize: 14,
    includeFontPadding: false,
    lineHeight: 20,
    maxWidth: '100%',
    minHeight: 20,
    minWidth: 0,
  },
});
