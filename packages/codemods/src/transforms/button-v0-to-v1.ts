import type { Transform, JSCodeshift, FileInfo, API, Options, ImportDeclaration, ASTPath, JSXElement } from 'jscodeshift';

export const transform: Transform = (fileInfo: FileInfo, api: API, options: Options) => {
  const j: JSCodeshift = api.jscodeshift;

  const printOptions = options.printOptions || {
    printWidth: 140,
    quote: 'single',
    tabWidth: 2,
    trailingComma: true,
  };

  const root = j(fileInfo.source);
  root
    // Find all imports that import from '@fluentui/react-native' or '@fluentui-react-native/button'
    .find(
      j.ImportDeclaration,
      (path: ImportDeclaration) => path.source.value === '@fluentui/react-native' || path.source.value === '@fluentui-react-native/button',
    )
    .forEach((path: ASTPath<ImportDeclaration>) => {
      if (!path.value.specifiers) {
        return;
      }

      // Find the first import specifier that imports Button, PrimaryButton or StealthButton.
      const buttonSpecifier = path.value.specifiers.findIndex(
        (specifier) =>
          specifier.type === 'ImportSpecifier' &&
          (specifier.imported.name === 'Button' ||
            specifier.imported.name === 'PrimaryButton' ||
            specifier.imported.name === 'StealthButton'),
      );

      // Change that import to be 'ButtonV1 as Button'
      if (buttonSpecifier !== undefined && buttonSpecifier !== -1) {
        path.value.specifiers[buttonSpecifier] = j.importSpecifier(j.identifier('ButtonV1'), j.identifier('Button'));
      }

      // Filter out all other instances of importing Button, PrimaryButton, or StealthButton so that ButtonV1 is only imported once.
      path.value.specifiers = path.value.specifiers.filter(
        (specifier) =>
          specifier.type !== 'ImportSpecifier' ||
          (specifier.imported.name !== 'Button' &&
            specifier.imported.name !== 'PrimaryButton' &&
            specifier.imported.name !== 'StealthButton'),
      );
    });

  // Change JSX instances of previous buttons to new type of button
  root.findJSXElements('PrimaryButton').forEach((path: ASTPath<JSXElement>) => {
    if (path.value.openingElement.name.type === 'JSXIdentifier') {
      path.value.openingElement.name.name = 'Button';
      if (path.value.openingElement.attributes === undefined) {
        path.value.openingElement.attributes = [];
      }
      path.value.openingElement.attributes.push(j.jsxAttribute(j.jsxIdentifier('appearance'), j.literal('primary')));
    }
  });

  root.findJSXElements('StealthButton').forEach((path) => {
    if (path.value.openingElement.name.type === 'JSXIdentifier') {
      path.value.openingElement.name.name = 'Button';

      if (path.value.openingElement.attributes === undefined) {
        path.value.openingElement.attributes = [];
      }
      path.value.openingElement.attributes.push(j.jsxAttribute(j.jsxIdentifier('appearance'), j.literal('subtle')));
    }
  });

  // Replace old props with new props
  root.findJSXElements('Button').forEach((path) => {
    let attributes = path.value.openingElement.attributes;
    if (attributes === undefined) {
      attributes = [];
    }

    attributes.forEach((attribute) => {
      if (attribute.type === 'JSXAttribute') {
        if (attribute.name.name === 'startIcon') {
          attribute.name.name = 'icon';

          attributes!.push(j.jsxAttribute(j.jsxIdentifier('iconPosition'), j.literal('before')));
        }

        if (attribute.name.name === 'endIcon') {
          attribute.name.name = 'icon';

          attributes!.push(j.jsxAttribute(j.jsxIdentifier('iconPosition'), j.literal('after')));
        }

        if (attribute.name.name === 'content') {
          path.value.openingElement.selfClosing = false;
          path.value.closingElement = j.jsxClosingElement(j.jsxIdentifier('Button'));

          const child = attribute.value;
          if (child) {
            path.value.children = [child];
          }
        }
      }
    });

    path.value.openingElement.attributes = attributes.filter((path) => path.type === 'JSXSpreadAttribute' || path.name.name !== 'content');
  });

  return root.toSource(printOptions);
};

export default transform;
