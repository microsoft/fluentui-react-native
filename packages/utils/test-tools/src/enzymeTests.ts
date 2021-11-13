import { mount, ReactWrapper } from 'enzyme';

export type JSXProducer = () => JSX.Element;

export interface PropTreeFilter {
  children?: boolean;
  functions?: boolean;
}

export type PropTreeSnapshot = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  props: object;
  children: PropTreeSnapshot[];
};

export function snapshotPropTree(node: ReactWrapper, recurse: number, filter: PropTreeFilter = {}): PropTreeSnapshot {
  // get a potentially filtered copy of the props
  const nodeProps = node.props();
  const props = {};
  Object.keys(nodeProps).forEach((key) => {
    if (!(filter.children && key === 'children') && !(filter.functions && typeof nodeProps[key] === 'function')) {
      props[key] = nodeProps[key];
    }
  });

  // then build the base result
  const result: PropTreeSnapshot = { name: node.name(), props, children: [] };

  // if children are requested add children
  if (recurse > 0) {
    node.children().forEach((child) => {
      result.children.push(snapshotPropTree(child, recurse - 1, filter));
    });
  }
  return result;
}

export function compareTrees(a: PropTreeSnapshot, b: PropTreeSnapshot, paths: string[]): void {
  const newPaths = paths.concat(a.name);
  if (a.name !== b.name) {
    throw new Error(`Shallow compare found two nodes with different names at ${paths.join(': ')}`);
  }
  if (a.children.length !== b.children.length) {
    throw new Error(`Shallow compare found two nodes at ${paths.join(': ')} with different children counts`);
  }
  if (Object.keys(a.props).length !== Object.keys(b.props).length) {
    throw new Error(`Shallow compare found props at ${paths.join(': ')} with different property counts`);
  }
  Object.keys(a.props).forEach((key) => {
    if (a.props[key] !== b.props[key]) {
      throw new Error(`Shallow compare failed for ${paths.join(': ')}, key: ${key}`);
    }
  });
  for (let i = 0; i < a.children.length; i++) {
    compareTrees(a.children[i], b.children[i], newPaths);
  }
}

export function checkRenderConsistency(render: JSXProducer, depth: number = 1) {
  const filter = { children: true, functions: true };
  const t1 = snapshotPropTree(mount(render()), depth, filter);
  const t2 = snapshotPropTree(mount(render()), depth, filter);
  compareTrees(t1, t2, []);
}

export function checkReRender(render: JSXProducer, depth: number = 1) {
  const filter = { children: true };
  const w1 = mount(render());
  const t1 = snapshotPropTree(w1, depth, filter);
  w1.setProps({});
  const w2 = w1.update();
  const t2 = snapshotPropTree(w2, depth, filter);
  compareTrees(t1, t2, []);
}
