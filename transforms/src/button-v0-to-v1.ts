'use strict';

module.exports = function (fileInfo, api, options) {
  const j = api.jscodeshift;

  const printOptions = options.printOptions || {
    quote: 'single',
    trailingComma: true,
  };

  const root = j(fileInfo.source);
  root
    .find(
      j.ImportDeclaration,
      (path) => path.source.value === '@fluentui/react-native' || path.source.value === '@fluentui-react-native/button',
    )
    .forEach((path) => {
      path.value.specifiers.forEach((specifier) => {
        if (
          specifier.imported.name === 'Button' ||
          specifier.imported.name === 'PrimaryButton' ||
          specifier.imported.name === 'StealthButton'
        ) {
          specifier.imported = 'ButtonV1';
          specifier.local.name = 'Button';
        }
      });
    });

  // Make more robust?
  root
    .find(j.ImportDeclaration, (path) => path.source.value === '@fluentui-react-native/button-experimental')
    .forEach((path) => {
      path.source.value = '@fluentui/react-native';
    });

  // Change previous buttons to new type of button
  root.findJSXElements('PrimaryButton').forEach((path) => {
    path.value.openingElement.name.name = 'Button';
    path.value.openingElement.attributes.push(j.jsxAttribute(j.jsxIdentifier('appearance'), j.literal('primary')));
  });
  root.findJSXElements('StealthButton').forEach((path) => {
    path.value.openingElement.name.name = 'Button';
    path.value.openingElement.attributes.push(j.jsxAttribute(j.jsxIdentifier('appearance'), j.literal('subtle')));
  });

  // Replace old props with new props
  root.findJSXElements('Button').forEach((path) => {
    path.value.openingElement.attributes.forEach((attribute) => {
      if (attribute.name.name === 'startIcon') {
        attribute.name.name = 'icon';

        path.value.openingElement.attributes.push(j.jsxAttribute(j.jsxIdentifier('iconPosition'), j.literal('before')));
      }

      if (attribute.name.name === 'endIcon') {
        attribute.name.name = 'icon';

        path.value.openingElement.attributes.push(j.jsxAttribute(j.jsxIdentifier('iconPosition'), j.literal('after')));
      }

      if (attribute.name.name === 'content') {
        const child = attribute.value;

        path.value.openingElement.selfClosing = false;
        path.value.closingElement = j.jsxClosingElement(j.jsxIdentifier('Button'));
        path.value.children.push(child);
      }
    });
    path.value.openingElement.attributes = path.value.openingElement.attributes.filter((path) => path.name.name !== 'content');
  });

  // tokens????

  return root.toSource(printOptions);
};
