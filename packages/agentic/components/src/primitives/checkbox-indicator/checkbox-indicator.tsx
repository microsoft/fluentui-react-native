/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';

import { directComponent } from '@fluentui-react-native/framework-base';

import { semanticIconSources } from '../../common/iconSources';
import { Icon } from '../icon/icon';
import type { CheckboxIndicatorProps } from './checkbox-indicator.types';

export const CheckboxIndicator = directComponent<CheckboxIndicatorProps>(
  ({
    checkedIconSource = semanticIconSources.checkmark,
    iconColor,
    iconSize = 12,
    indeterminateIconSource = semanticIconSources.indeterminate,
    status = 'unchecked',
    style,
    ...rest
  }) => (
    <View {...rest} accessible={false} style={style}>
      {status === 'unchecked' ? null : (
        <Icon
          accessible={false}
          color={iconColor}
          height={iconSize}
          svgSource={status === 'indeterminate' ? indeterminateIconSource : checkedIconSource}
          testID={status === 'indeterminate' ? 'checkbox-dash-icon' : 'checkbox-check-icon'}
          width={iconSize}
        />
      )}
    </View>
  ),
);

CheckboxIndicator.displayName = 'CheckboxIndicator';
