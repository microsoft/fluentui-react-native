/** @jsxImportSource @fluentui-react-native/framework-base */
import { Button } from '../button/button';
import { commandPressProps } from '../button/commandPress';
import { navItemStyles } from './nav-item.styles';
import type { NavItemState } from './nav-item.types';

export function renderNavItem_unstable(state: NavItemState) {
  const { FocusRing, icon: Leading, avatar: Avatar, label: Label, badge: Badge, chevron: Chevron, indicator: Indicator } = state;
  return (
    <state.root>
      <state.primary ref={state.focusTargetRef}>
        {FocusRing && <FocusRing />}
        {Indicator && <Indicator />}
        {Leading && <Leading />}
        {Avatar && <Avatar />}
        {Label && <Label />}
        {Badge && <Badge />}
        {Chevron && <Chevron />}
      </state.primary>
      {state.actions.map((action) => (
        <Button
          key={action.key}
          testID={action.testID}
          content={action.label}
          size="small"
          appearance="subtle"
          disabled={state.disabled}
          style={navItemStyles.secondary}
          {...commandPressProps(action.onPress, state.disabled)}
        />
      ))}
    </state.root>
  );
}
