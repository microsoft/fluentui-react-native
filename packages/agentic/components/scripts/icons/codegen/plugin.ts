// Temporary local copy of the codegen in microsoft/fluentui-system-icons#1292 (`@fluentui/react-native-icons/codegen`).
// Delete this folder and import from that package once it is published and clears the dependency age gate.

export interface FluentSvgPluginOptions {
  resizable: boolean;
  isColorIcon: boolean;
}

// The subset of the Babel API this plugin touches, because `@types/babel__core` is not a dependency of this package.
interface JsxName {
  name?: string;
}

interface JsxAttributeNode {
  name?: JsxName;
  value?: any;
}

interface JsxOpeningElementNode {
  name: JsxName;
  attributes: JsxAttributeNode[];
}

interface BabelTypes {
  isIdentifier(node: unknown, options?: { name: string }): boolean;
  isNumericLiteral(node: unknown): boolean;
  isStringLiteral(node: unknown): boolean;
  jsxAttribute(name: JsxName, value?: unknown): JsxAttributeNode;
  jsxIdentifier(name: string): JsxName;
}

interface JsxElementPath {
  parentPath: { isExpressionStatement(): boolean };
  node: { openingElement: JsxOpeningElementNode; closingElement?: { name: JsxName } | null };
  traverse(visitor: { JSXOpeningElement(child: { node: JsxOpeningElementNode }): void }): void;
}

/** Babel plugin that turns the SVGR output root into a compact `FluentSvg` element. */
export function fluentSvgPlugin({ types: t }: { types: BabelTypes }, { resizable, isColorIcon }: FluentSvgPluginOptions) {
  return {
    visitor: {
      JSXElement: {
        exit(path: JsxElementPath) {
          // Compact only the root after SVGR has normalized native elements and dimensions.
          if (!path.parentPath.isExpressionStatement()) {
            return;
          }

          const { openingElement, closingElement } = path.node;
          // useIconState always replaces the root fill with primaryFill, so a root fill (e.g. "none" on color icons) is dead code.
          openingElement.attributes = openingElement.attributes.filter((attribute) => attribute.name?.name !== 'fill');
          const inheritedFills: [JsxOpeningElementNode, JsxAttributeNode][] = [];
          let canInheritFill = !isColorIcon;
          path.traverse({
            JSXOpeningElement(child) {
              // Canonical web SVGs keep XML namespaces, which react-native-svg does not accept.
              if (/^svg$/i.test(child.node.name.name)) {
                child.node.attributes = child.node.attributes.filter(
                  (attribute) => !['xmlns', 'xmlnsXlink'].includes(attribute.name?.name),
                );
              }
              if (
                child.node !== openingElement &&
                !['Path', 'Circle', 'Ellipse', 'Line', 'Polygon', 'Polyline', 'Rect'].includes(child.node.name.name)
              ) {
                canInheritFill = false;
              }
              for (const attribute of child.node.attributes) {
                if (attribute.name?.name === 'style') {
                  canInheritFill = false;
                }
                if (attribute.name?.name === 'fill') {
                  if (t.isIdentifier(attribute.value?.expression, { name: 'primaryFill' })) {
                    inheritedFills.push([child.node, attribute]);
                  } else {
                    canInheritFill = false;
                  }
                }
              }
            },
          });
          if (canInheritFill) {
            for (const [element, fill] of inheritedFills) {
              element.attributes = element.attributes.filter((attribute) => attribute !== fill);
            }
          }

          const getAttribute = (name: string) => openingElement.attributes.find((attribute) => attribute.name?.name === name);
          const width = getAttribute('width');
          const height = getAttribute('height');
          const square =
            t.isNumericLiteral(width?.value?.expression) &&
            t.isNumericLiteral(height?.value?.expression) &&
            width.value.expression.value === height.value.expression.value;
          const size = !resizable && square ? width.value.expression.value : undefined;

          // FluentSvg defaults resizable icons to 24x24 and sized icons to `size`.
          if (square && (!resizable || width.value.expression.value === 24)) {
            openingElement.attributes = openingElement.attributes.filter((attribute) => attribute !== width && attribute !== height);
            if (size !== undefined) {
              openingElement.attributes.unshift(t.jsxAttribute(t.jsxIdentifier('size'), width.value));
            }
          }

          const viewBox = getAttribute('viewBox');
          const defaultViewBox = [0, 0, size ?? 20, size ?? 20];
          const coordinates = t.isStringLiteral(viewBox?.value)
            ? viewBox.value.value
                .trim()
                .split(/[\s,]+/)
                .map(Number)
            : [];
          if (coordinates.length === 4 && coordinates.every((coordinate, index) => coordinate === defaultViewBox[index])) {
            openingElement.attributes = openingElement.attributes.filter((attribute) => attribute !== viewBox);
          }

          openingElement.name = t.jsxIdentifier('FluentSvg');
          if (closingElement) {
            closingElement.name = t.jsxIdentifier('FluentSvg');
          }
        },
      },
    },
  };
}
