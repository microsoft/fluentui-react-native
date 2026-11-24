/** @jsxImportSource @fluentui-react-native/framework-base */
import { Fragment } from 'react';
import { I18nManager, ScrollView } from 'react-native';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { Icon } from '../../primitives/icon/icon';
import { Text } from '../text/text';
import { breadcrumbStyles } from './breadcrumb.styles';
import type { BreadcrumbAncestor, BreadcrumbState } from './breadcrumb.types';
import { BreadcrumbDestination } from './breadcrumbDestination';
import { BreadcrumbOverflow } from './breadcrumbOverflow';

export function renderBreadcrumb_unstable(state: BreadcrumbState) {
  const { leading, overflow, trailing, typography, separator, triggerWidth } = state.layout;
  const LeadingIcon = state.leadingIcon;
  const separatorNode = () => (
    <Icon {...hiddenFromAccessibilityProps} {...separator} fontSource={{ codepoint: I18nManager.isRTL ? 0x2039 : 0x203a }} />
  );
  const destination = (item: BreadcrumbAncestor) => (
    <Fragment key={`destination:${item.key}`}>
      <BreadcrumbDestination item={item} state={state} />
      {separatorNode()}
    </Fragment>
  );
  const trail = leading.map(destination);
  if (overflow.length) {
    trail.push(
      <Fragment key="overflow">
        <BreadcrumbOverflow
          style={breadcrumbStyles.trigger}
          trigger={{
            ref: state.triggerFocus.focusTargetRef,
            onFocus: state.triggerFocus.onFocus,
            onBlur: state.triggerFocus.onBlur,
            accessibilityLabel: state.overflowLabel,
            leadingIcon: { fontSource: { codepoint: 0x2026 } },
            style: { minWidth: triggerWidth },
            size: state.size,
            appearance: 'subtle',
          }}
          surface={{ accessibilityLabel: state.overflowLabel, style: breadcrumbStyles.popupSurface }}
          open={state.open}
          onOpenChange={state.onOpenChange}
          restoreOnClose={state.restoreOnClose}
        >
          <ScrollView style={breadcrumbStyles.popup} contentContainerStyle={breadcrumbStyles.popupContent}>
            {overflow.map((item) => (
              <BreadcrumbDestination key={item.key} item={item} state={state} inPopover />
            ))}
          </ScrollView>
        </BreadcrumbOverflow>
        {separatorNode()}
      </Fragment>,
    );
  }
  trail.push(...trailing.map(destination));
  return (
    <state.root>
      {LeadingIcon && <LeadingIcon />}
      {trail}
      <state.current>
        <state.currentLabel />
      </state.current>
      {state.items.length > 2 && (
        <state.measureRow>
          {state.items.map((item) => (
            <Text
              key={item.key}
              {...hiddenFromAccessibilityProps}
              style={[typography, breadcrumbStyles.probeLabel]}
              onLayout={(event) => state.measure(item.key, item.label, event.nativeEvent.layout.width)}
            >
              {item.label}
            </Text>
          ))}
        </state.measureRow>
      )}
    </state.root>
  );
}
