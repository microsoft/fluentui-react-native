/**
 * Given the various transforms that can happen to children with the legacy framework and v1 frameworks, this
 * utility normalizes children to a form that react can handle consistently.
 * - if the children are an array of length 0, null will be returned
 * - if the children are an array of length 1, the single child will be returned
 * - if the children are an array of length > 1, the array will be returned as is
 * - otherwise children will returned as is
 * @param children the children to normalize
 * @returns the normalized children
 */
export function normalizeChildren(children: React.ReactNode): React.ReactNode {
  if (Array.isArray(children)) {
    if (children.length === 0) {
      return null;
    } else if (children.length === 1) {
      return normalizeChildren(children[0]);
    }
  }
  return children;
}

/**
 * Combine a set of children prop values into a single children prop value. This is useful to
 * ensure that null values don't overwrite non-null values. This can happen because an item <MyElement /> will have
 * null set as the children prop by JSX, which can overwrite places where children are set via props.
 * @param children the children prop values to reconcile
 * @returns the prop value that should be used for children
 */
export function reconcileChildren(...children: React.ReactNode[]): React.ReactNode | undefined {
  if (children.length === 0) {
    return undefined;
  }
  return children.findLast(isNonNullChild) ?? children.findLast(isNullChild);
}

/**
 * Helper to check for non-null without creating unnecessary closures.
 */
function isNonNullChild(child: React.ReactNode): child is NonNullable<React.ReactNode> {
  return child != null;
}

/**
 * Helper to check for null without creating unnecessary closures.
 */
function isNullChild(child: React.ReactNode): child is null {
  return child === null;
}

/**
 * Helper to get the first child from an unknown props type object.
 * - if the children is a single child it will be returned as is
 * - if the children is null or undefined undefined will be returned
 * - if the children is an array the first child will be returned
 */
export function getSingleChild(children?: React.ReactNode) {
  if (children != null) {
    if (!Array.isArray(children)) {
      return children;
    } else if (children.length > 0) {
      return children[0];
    }
  }
  return undefined;
}

/**
 * Helper to get the children as an array from an unknown props type object. Normalizing to catch
 * an array of length 1 that contains an array
 * - if the children is a single child it will be wrapped in an array
 * - if the children is null or undefined an empty array will be returned
 */
export function getChildrenAsArray(children?: React.ReactNode): React.ReactNode[] {
  if (children == null) {
    return [];
  } else if (Array.isArray(children)) {
    if (children.length === 1 && Array.isArray(children[0])) {
      return children[0];
    }
    return children;
  }
  return [children];
}
