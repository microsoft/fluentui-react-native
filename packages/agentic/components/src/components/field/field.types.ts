import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, OptionalSlot, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { ReactNode } from 'react';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { Icon } from '../../primitives/icon/icon';
import type { InfoLabelHelp } from '../info-label/info-label.types';
import type { Label } from '../label/label';
import type { LabelSize, LabelTarget, LabelWeight } from '../label/label.types';
import type { Text } from '../text/text';
import type { FieldInfoLabel } from './fieldInfoLabel';

export type FieldOrientation = 'vertical' | 'horizontal';
export type FieldStatus = 'rest' | 'error' | 'warning' | 'success' | 'disabled';
export type FieldBinding = Readonly<{
  label: string;
  labelID: string;
  descriptionIDs: readonly string[];
  size: LabelSize;
  required: boolean;
  disabled: boolean;
  invalid: boolean;
}>;

export type FieldProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    label: string;
    renderControl: (binding: FieldBinding) => ReactNode;
    target?: LabelTarget;
    size?: LabelSize;
    orientation?: FieldOrientation;
    labelProps?: { weight?: LabelWeight };
    info?: InfoLabelHelp;
    helperText?: string;
    validationMessage?: string;
    status?: FieldStatus;
    required?: boolean;
  };

export type FieldState = ThemeState &
  ComponentState<{
    root: Slot<typeof View>;
    label: OptionalSlot<typeof Label>;
    infoLabel: OptionalSlot<typeof FieldInfoLabel>;
    controlColumn: Slot<typeof View>;
    messageStack: OptionalSlot<typeof View>;
    helper: OptionalSlot<typeof View>;
    helperLabel: OptionalSlot<typeof Text>;
    validationRow: OptionalSlot<typeof View>;
    validationText: OptionalSlot<typeof View>;
    validationLabel: OptionalSlot<typeof Text>;
    validationIcon: OptionalSlot<typeof Icon>;
  }> & {
    size: LabelSize;
    orientation: FieldOrientation;
    status: FieldStatus;
    binding: FieldBinding;
    renderControl: FieldProps['renderControl'];
    userStyle?: StyleProp<ViewStyle>;
  };
