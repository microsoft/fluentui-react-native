import React from 'react';
import Svg, { G, Path, SvgProps } from 'react-native-svg';
import { ButtonProps, ButtonTokens, ButtonV1 as Button } from '@fluentui-react-native/button';
import { mergeProps, stagedComponent } from '@fluentui-react-native/framework';
import { SvgIconProps, createIconProps } from '@fluentui-react-native/icon';
import { NotificationProps } from './Notification.types';

export type NotificationButtonColorStates = { disabledColor; pressedColor };

type NotificationButtonProps = ButtonProps & ButtonTokens & NotificationButtonColorStates;

function getDismissSvgProps() {
  const dismissSvg: React.FunctionComponent<SvgProps> = (props: SvgProps) => {
    const path =
      'M3.89705 4.05379L3.96967 3.96967C4.23594 3.7034 4.6526 3.6792 4.94621 3.89705L5.03033 3.96967L10 8.939L14.9697 3.96967C15.2359 3.7034 15.6526 3.6792 15.9462 3.89705L16.0303 3.96967C16.2966 4.23594 16.3208 4.6526 16.1029 4.94621L16.0303 5.03033L11.061 10L16.0303 14.9697C16.2966 15.2359 16.3208 15.6526 16.1029 15.9462L16.0303 16.0303C15.7641 16.2966 15.3474 16.3208 15.0538 16.1029L14.9697 16.0303L10 11.061L5.03033 16.0303C4.76406 16.2966 4.3474 16.3208 4.05379 16.1029L3.96967 16.0303C3.7034 15.7641 3.6792 15.3474 3.89705 15.0538L3.96967 14.9697L8.939 10L3.96967 5.03033C3.7034 4.76406 3.6792 4.3474 3.89705 4.05379L3.96967 3.96967L3.89705 4.05379Z';
    return (
      <Svg color={props.color}>
        <G>
          <Path fill="currentColor" d={path} />
        </G>
      </Svg>
    );
  };

  const svgProps: SvgIconProps = {
    src: dismissSvg,
  };
  return svgProps;
}

export function createNotificationButtonProps(userProps: NotificationProps) {
  if (userProps.onActionPress) {
    if (userProps.action) {
      return {
        onClick: userProps.onActionPress,
        children: userProps.action,
      };
    } else {
      const dismissIconProps = createIconProps({ svgSource: getDismissSvgProps(), width: 20, height: 20 });
      return {
        accessibilityLabel: 'Dismiss',
        onClick: userProps.onActionPress,
        icon: dismissIconProps,
      };
    }
  }
  return null;
}

/**
 * We need to customize Notification's `action` slot's tokens based on Notification's variant prop.
 * Compose doesn't let us easily do that via styling settings
 *    (e.g. setting color in Notification.styling.ts will not apply to the action button text)
 * This helper component is used to customize tokens via props.
 */
export const NotificationButton = stagedComponent((props: NotificationButtonProps) => {
  const CustomizedButton = Button.customize({
    subtle: {
      backgroundColor: 'transparent',
      color: props.color,
      iconColor: props.color,
      fontSize: 15,
      fontWeight: '600',
      fontLineHeight: 20,
      fontLetterSpacing: -0.23, // iOS only prop
      disabled: {
        color: props.disabledColor,
      },
      pressed: {
        color: props.pressedColor,
      },
    },
  });

  return (final: NotificationButtonProps, children: React.ReactNode) => {
    const mergedProps = mergeProps(props, final);
    return <CustomizedButton {...mergedProps}>{children}</CustomizedButton>;
  };
}, true);
