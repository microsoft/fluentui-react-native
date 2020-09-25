import { mount, ReactWrapper } from 'enzyme';

export type JSXProducer = () => JSX.Element;

export function shallowCompare<A extends object, B extends object>(a: A, b: B, paths: string[] = [], testFunctions?: boolean): void {
  if (Object.keys(a).length !== Object.keys(b).length) {
    throw new Error(`Shallow compare found two nodes at ${paths.join(': ')} with different property counts`);
  }
  Object.keys(a).forEach((key) => {
    if (key !== 'children' && (typeof a[key] !== 'function' || testFunctions) && a[key] !== b[key]) {
      throw new Error(`Shallow compare failed for ${paths.join(': ')}, key: ${key}`);
    }
  });
}

export function compareNodes(n1: ReactWrapper, n2: ReactWrapper, paths: string[], recurse?: number): void {
  // shallow compare the two
  const newPaths = paths.concat(n1.name());
  shallowCompare(n1.props(), n2.props(), newPaths);
  if (recurse && recurse > 0) {
    let n2index = 0;
    n1.children().forEach((node) => {
      const node2 = n2.childAt(n2index++);
      compareNodes(node, node2, newPaths, recurse - 1);
    });
  }
}

export function checkRenderConsistency(render: JSXProducer, depth: number = 1) {
  const w1 = mount(render());
  const w2 = mount(render());
  compareNodes(w1, w2, [], depth);
}
