import * as React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';

export interface ListItemProps {
  action?: React.ReactNode;
  children?: React.ReactNode;
  id: string;
  onPress?: (event: GestureResponderEvent) => void;
  secondaryAction?: React.ReactNode;
}

export interface ListProps {
  children?: React.ReactNode;
  defaultSelectedItems?: string[];
  multiselect?: boolean;
  onSelectionChange?: (selectedItems: string[]) => void;
  selectedItems?: string[];
}

export function ListItem(_props: ListItemProps): React.ReactElement | null {
  return null;
}

export function List({children, defaultSelectedItems = [], multiselect, onSelectionChange, selectedItems}: ListProps): React.ReactElement {
  const [uncontrolled, setUncontrolled] = React.useState(defaultSelectedItems);
  const current = selectedItems ?? uncontrolled;
  const items = React.Children.toArray(children).filter(React.isValidElement<ListItemProps>);
  const select = (event: GestureResponderEvent, item: ListItemProps) => {
    item.onPress?.(event);
    const next = multiselect
      ? current.includes(item.id) ? current.filter(id => id !== item.id) : [...current, item.id]
      : [item.id];
    if (selectedItems === undefined) {
      setUncontrolled(next);
    }
    onSelectionChange?.(next);
  };
  return (
    <View accessibilityRole="list" style={styles.root}>
      {items.map(element => {
        const item = element.props;
        const selected = current.includes(item.id);
        return (
          <Pressable accessibilityRole="button" accessibilityState={{selected}} key={item.id} onPress={event => select(event, item)} style={[styles.item, selected && styles.selected]}>
            <View style={styles.content}>{typeof item.children === 'string' ? <Text style={styles.text}>{item.children}</Text> : item.children}</View>
            {item.action}<View>{item.secondaryAction}</View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {flex: 1},
  item: {alignItems: 'center', borderBottomColor: '#e0e0e0', borderBottomWidth: 1, flexDirection: 'row', gap: 8, minHeight: 44, paddingHorizontal: 12},
  root: {borderColor: '#d1d1d1', borderRadius: 4, borderWidth: 1, overflow: 'hidden', width: '100%'},
  selected: {backgroundColor: '#ebf3fc', borderLeftColor: '#0f6cbd', borderLeftWidth: 3},
  text: {color: '#242424'},
});
