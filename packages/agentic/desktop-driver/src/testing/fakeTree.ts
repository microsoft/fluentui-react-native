import type { FakeDesktopElement } from '../hosts/fake/FakeDesktopHost.js';

export type FakeTreeShape = {
  /** Levels below the root. */
  depth: number;
  /** Children per element above the deepest level. */
  fanout: number;
  windowId?: string;
};

/** A complete, deterministic tree for observation tests: root `n`, its children `n.0`, `n.1`, and so on. */
export function createFakeTree({ depth, fanout, windowId = 'window-1' }: FakeTreeShape): FakeDesktopElement[] {
  const elements: FakeDesktopElement[] = [];
  const add = (id: string, level: number, parentId?: string) => {
    elements.push({
      automationId: `auto-${id}`,
      id,
      name: `Name ${id}`,
      ...(parentId === undefined ? {} : { parentId }),
      rect: { height: 20, width: 100, x: 0, y: level * 20 },
      role: level === 0 ? 'application' : level === depth ? 'button' : 'group',
      scope: level === 0 ? 'application' : 'preview',
      windowId,
    });
    if (level < depth) {
      for (let index = 0; index < fanout; index += 1) {
        add(`${id}.${index}`, level + 1, id);
      }
    }
  };
  add('n', 0);
  return elements;
}

/** The element count of a tree built from a shape. */
export function fakeTreeSize({ depth, fanout }: FakeTreeShape): number {
  let size = 0;
  let level = 1;
  for (let index = 0; index <= depth; index += 1) {
    size += level;
    level *= fanout;
  }
  return size;
}
