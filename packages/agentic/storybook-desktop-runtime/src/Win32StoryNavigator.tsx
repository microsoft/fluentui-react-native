import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, Input, Text } from '@fluentui-react-native/components';
import { useFocusTarget } from '@fluentui-react-native/framework-base';
import createFuzzySearch from '@nozbe/microfuzz';
import type { API_IndexHash } from 'storybook/internal/types';

type StoryIndexEntry = API_IndexHash[string];

type SearchItem = {
  id: string;
  name: string;
  searchText: string;
};

type Win32StoryNavigatorProps = {
  expanded: Record<string, boolean>;
  index: API_IndexHash;
  onExpandedChange: (id: string, value: boolean) => void;
  onExpandAll: (value: boolean) => void;
  onQueryChange: (query: string) => void;
  onSelectedStoryFocus?: (storyId: string) => void;
  onSelectedStoryFocusUnavailable?: (storyId: string) => void;
  onSearchActiveChange: (active: boolean) => void;
  onSelectStory: (storyId: string) => void;
  query: string;
  searchActive: boolean;
  focusSelectedStoryID?: string;
  selectedStoryId?: string;
  testID: string;
};

function isBranch(entry: StoryIndexEntry): entry is Extract<StoryIndexEntry, { type: 'root' | 'group' | 'component' }> {
  return entry.type === 'root' || entry.type === 'group' || entry.type === 'component';
}

function parentID(entry: StoryIndexEntry): string | undefined {
  return 'parent' in entry ? entry.parent : undefined;
}

function collectSearchItems(index: API_IndexHash): SearchItem[] {
  const entries = Object.values(index);
  return entries
    .filter((entry) => entry.type === 'story' || entry.type === 'docs')
    .map((entry) => {
      const path: string[] = [];
      let current: StoryIndexEntry | undefined = entry;
      while (current) {
        path.unshift(current.name);
        const parent = parentID(current);
        current = parent ? index[parent] : undefined;
      }
      return { id: entry.id, name: entry.name, searchText: `${entry.name} ${path.join(' ')}` };
    });
}

function branchIDs(index: API_IndexHash): string[] {
  return Object.values(index)
    .filter(isBranch)
    .map(({ id }) => id);
}

export function searchStoryEntries(index: API_IndexHash, query: string): SearchItem[] {
  const searchText = query.trim();
  if (!searchText) {
    return [];
  }
  const items = collectSearchItems(index);
  return createFuzzySearch(items, { key: 'searchText' })(searchText).map(({ item }) => item);
}

export function Win32StoryNavigator({
  expanded,
  index,
  onExpandedChange,
  onExpandAll,
  onQueryChange,
  onSelectedStoryFocus,
  onSelectedStoryFocusUnavailable,
  onSearchActiveChange,
  onSelectStory,
  query,
  searchActive,
  focusSelectedStoryID,
  selectedStoryId,
  testID,
}: Win32StoryNavigatorProps) {
  const scrollRef = React.useRef<ScrollView>(null);
  const storyFocus = useFocusTarget(focusSelectedStoryID !== undefined);
  const searchResults = React.useMemo(() => searchStoryEntries(index, query), [index, query]);
  const [visibleSearchCount, setVisibleSearchCount] = React.useState(50);

  React.useEffect(() => {
    if (!focusSelectedStoryID || !storyFocus.focusTarget.current) {
      return;
    }

    const request = storyFocus.focusTarget.requestFocus('restore');
    if (request.status === 'confirmed') {
      onSelectedStoryFocus?.(focusSelectedStoryID);
    } else if (request.status !== 'requested') {
      console.warn(`Win32 story navigation could not restore focus to "${focusSelectedStoryID}": ${request.status}.`);
      onSelectedStoryFocusUnavailable?.(focusSelectedStoryID);
    }
  }, [focusSelectedStoryID, onSelectedStoryFocus, onSelectedStoryFocusUnavailable, storyFocus.focusTarget]);

  React.useEffect(() => {
    if (focusSelectedStoryID && storyFocus.focused) {
      onSelectedStoryFocus?.(focusSelectedStoryID);
    }
  }, [focusSelectedStoryID, onSelectedStoryFocus, storyFocus.focused]);

  React.useEffect(() => {
    setVisibleSearchCount(50);
  }, [query]);

  const revealSelected = React.useCallback(
    (id: string) => (event: { nativeEvent: { layout: { y: number } } }) => {
      if (id === selectedStoryId) {
        scrollRef.current?.scrollTo({ y: Math.max(0, event.nativeEvent.layout.y - 48), animated: false });
      }
    },
    [selectedStoryId],
  );

  const renderEntry = (id: string, depth: number): React.ReactNode => {
    const entry = index[id];
    if (!entry) {
      return null;
    }

    if (!isBranch(entry)) {
      const selected = id === selectedStoryId;
      return (
        <Button
          accessibilityLabel={entry.name}
          accessibilityState={{ selected }}
          appearance={selected ? 'secondary' : 'subtle'}
          content={entry.name}
          key={id}
          onLayout={revealSelected(id)}
          onFocus={id === focusSelectedStoryID ? storyFocus.onFocus : undefined}
          onBlur={id === focusSelectedStoryID ? storyFocus.onBlur : undefined}
          onPress={() => onSelectStory(id)}
          ref={id === focusSelectedStoryID ? storyFocus.focusTargetRef : undefined}
          style={[styles.node, { paddingStart: depth * 14 }]}
          testID={`${testID}-node-${id}`}
        />
      );
    }

    const isExpanded = expanded[id] ?? entry.type === 'root';
    const children = entry.children ?? [];
    return (
      <View key={id}>
        <Button
          accessibilityActions={[{ name: 'Expand' }, { name: 'Collapse' }]}
          accessibilityLabel={`${entry.name}, ${isExpanded ? 'expanded' : 'collapsed'}`}
          accessibilityState={{ expanded: isExpanded }}
          appearance="subtle"
          content={entry.name}
          onAccessibilityAction={(event) => {
            const action = event.nativeEvent.actionName;
            if (action === 'Expand') {
              onExpandedChange(id, true);
            } else if (action === 'Collapse') {
              onExpandedChange(id, false);
            }
          }}
          onPress={() => onExpandedChange(id, !isExpanded)}
          style={[styles.node, { paddingStart: depth * 14 }]}
          testID={`${testID}-node-${id}`}
        />
        {isExpanded ? children.map((child) => renderEntry(child, depth + 1)) : null}
      </View>
    );
  };

  const roots = Object.values(index).filter((entry) => entry.type === 'root');
  const visibleResults = searchResults.slice(0, visibleSearchCount);

  return (
    <View style={styles.root} testID={testID}>
      <View style={styles.controls}>
        <Input
          accessibilityLabel="Search stories"
          onChangeText={(value) => {
            onQueryChange(value);
            onSearchActiveChange(Boolean(value.trim()));
          }}
          placeholder="Search stories"
          size="small"
          style={styles.search}
          testID={`${testID}-search`}
          value={query}
        />
        <Button
          accessibilityLabel="Expand all story groups"
          appearance="subtle"
          content="Expand all"
          onPress={() => onExpandAll(true)}
          size="small"
          testID={`${testID}-expand-all`}
        />
        <Button
          accessibilityLabel="Collapse all story groups"
          appearance="subtle"
          content="Collapse all"
          onPress={() => onExpandAll(false)}
          size="small"
          testID={`${testID}-collapse-all`}
        />
      </View>
      {roots.length === 0 ? (
        <Text style={styles.empty}>No stories available.</Text>
      ) : searchActive ? (
        visibleResults.length === 0 ? (
          <Text style={styles.empty}>No stories found.</Text>
        ) : (
          <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" style={styles.list}>
            {visibleResults.map((item) => (
              <Button
                accessibilityLabel={`${item.name}, ${item.searchText}`}
                accessibilityState={{ selected: item.id === selectedStoryId }}
                appearance={item.id === selectedStoryId ? 'secondary' : 'subtle'}
                content={item.searchText}
                key={item.id}
                onLayout={revealSelected(item.id)}
                onPress={() => {
                  onSelectStory(item.id);
                  onSearchActiveChange(false);
                }}
                style={styles.node}
                testID={`${testID}-search-result-${item.id}`}
              />
            ))}
            {searchResults.length > visibleSearchCount ? (
              <Button
                appearance="subtle"
                content={`Show ${Math.min(50, searchResults.length - visibleSearchCount)} more results`}
                onPress={() => setVisibleSearchCount((count) => count + 50)}
                testID={`${testID}-show-more`}
              />
            ) : null}
          </ScrollView>
        )
      ) : (
        <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" style={styles.list}>
          {roots.map(({ id }) => renderEntry(id, 0))}
        </ScrollView>
      )}
    </View>
  );
}

export function getStoryAncestorIDs(index: API_IndexHash, storyId?: string): string[] {
  const ancestors: string[] = [];
  let current = storyId ? index[storyId] : undefined;
  while (current) {
    const parent = parentID(current);
    if (!parent) {
      break;
    }
    ancestors.push(parent);
    current = index[parent];
  }
  return ancestors;
}

export function getStoryBranchIDs(index: API_IndexHash): string[] {
  return branchIDs(index);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  controls: {
    gap: 4,
    padding: 8,
  },
  search: {
    minHeight: 34,
  },
  list: {
    flex: 1,
  },
  node: {
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    minHeight: 34,
  },
  empty: {
    padding: 12,
  },
});
