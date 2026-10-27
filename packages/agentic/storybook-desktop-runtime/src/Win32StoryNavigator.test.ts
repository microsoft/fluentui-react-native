import type { API_IndexHash } from 'storybook/internal/types';

import { getStoryAncestorIDs, getStoryBranchIDs, searchStoryEntries } from './Win32StoryNavigator';

const index: API_IndexHash = {
  root: { id: 'root', type: 'root', depth: 0, name: 'Components', tags: [], children: ['avatar', 'button'] },
  avatar: { id: 'avatar', type: 'component', depth: 1, name: 'Avatar', tags: [], parent: 'root', children: ['avatar--default'] },
  'avatar--default': {
    id: 'avatar--default',
    type: 'story',
    subtype: 'story',
    depth: 2,
    name: 'Default',
    tags: [],
    parent: 'avatar',
    title: 'Components/Avatar',
    importPath: './avatar.stories.tsx',
    exportName: 'Default',
    prepared: true,
  },
  button: { id: 'button', type: 'component', depth: 1, name: 'Button', tags: [], parent: 'root', children: ['button--default'] },
  'button--default': {
    id: 'button--default',
    type: 'story',
    subtype: 'story',
    depth: 2,
    name: 'Default',
    tags: [],
    parent: 'button',
    title: 'Components/Button',
    importPath: './button.stories.tsx',
    exportName: 'Default',
    prepared: true,
  },
};

describe('Win32 story navigation model', () => {
  it('searches fuzzy story names and paths while preserving raw IDs and duplicate names', () => {
    expect(searchStoryEntries(index, 'avat def')).toEqual([
      {
        id: 'avatar--default',
        name: 'Default',
        searchText: 'Default Components Avatar Default',
      },
    ]);
  });

  it('derives branch and selected-story ancestry from stable index IDs', () => {
    expect(getStoryBranchIDs(index)).toEqual(['root', 'avatar', 'button']);
    expect(getStoryAncestorIDs(index, 'avatar--default')).toEqual(['avatar', 'root']);
    expect(searchStoryEntries(index, '  ')).toEqual([]);
  });
});
