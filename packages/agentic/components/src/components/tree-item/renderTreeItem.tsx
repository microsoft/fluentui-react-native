/** @jsxImportSource @fluentui-react-native/framework-base */
import type { TreeItemState } from './tree-item.types';

export function renderTreeItem_unstable(state: TreeItemState) {
  const {
    FocusRing,
    chevron: Chevron,
    mark: Mark,
    avatar: Avatar,
    icon: Icon,
    badge: Badge,
    description: Description,
    action: Action,
    branch: Branch,
  } = state;
  return (
    <state.root>
      <state.row>
        <state.primary ref={state.focusTargetRef}>
          {FocusRing && <FocusRing />}
          <state.disclosure>{Chevron && <Chevron />}</state.disclosure>
          {Mark && <Mark />}
          {Avatar && <Avatar />}
          {Icon && <Icon />}
          <state.copy>
            <state.label />
            {Description && <Description />}
          </state.copy>
          {Badge && <Badge />}
        </state.primary>
        {Action && <Action />}
      </state.row>
      {Branch && <Branch>{state.children}</Branch>}
    </state.root>
  );
}
