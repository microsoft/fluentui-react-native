import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { HierarchyNode } from '../../common/keyedHierarchy';
import type { KeyedFocus } from '../../common/useKeyedFocus';
import type { TreeItemAppearance, TreeItemChecked, TreeItemLayout, TreeItemPresentation, TreeItemSize } from '../tree-item/tree-item.types';

export type TreeNode = { key: string; label: string; children?: readonly TreeNode[]; disabled?: boolean; testID?: string };
export type TreeSelectionMode = 'none' | 'single' | 'multiple';
type Change = (keys: readonly string[], details: { key: string }) => void;

export type TreeProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    items: readonly TreeNode[];
    renderItem?: (item: TreeNode) => TreeItemPresentation;
    openItems?: readonly string[];
    defaultOpenItems?: readonly string[];
    onOpenChange?: Change;
    selectionMode?: TreeSelectionMode;
    selectedKeys?: readonly string[];
    defaultSelectedKeys?: readonly string[];
    onSelectionChange?: Change;
    onActivate?: (key: string) => void;
    size?: TreeItemSize;
    layout?: TreeItemLayout;
    appearance?: TreeItemAppearance;
    accessibilityLabel: string;
  };

export type TreeState = ThemeState &
  ComponentState<{ root: Slot<typeof View> }> & {
    roots: readonly string[];
    nodes: ReadonlyMap<string, HierarchyNode<TreeNode>>;
    renderItem?: TreeProps['renderItem'];
    selectionMode: TreeSelectionMode;
    open: ReadonlySet<string>;
    selected: ReadonlySet<string>;
    checked: ReadonlyMap<string, TreeItemChecked>;
    focus: KeyedFocus;
    size: TreeItemSize;
    itemSize: TreeItemSize;
    appearance: TreeItemAppearance;
    layout: TreeItemLayout;
    userStyle?: StyleProp<ViewStyle>;
    setOpen(key: string, open: boolean): void;
    select(key: string): void;
    activate?: (key: string) => void;
  };
