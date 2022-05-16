module.exports = function (fileInfo, api, options) {
  const j = api.jscodeshift;

  const printOptions = options.printOptions || {
    quote: 'single',
    trailingComma: true,
  };

  const root = j(fileInfo.source);

  // Change import paths for component
  root
    .find(
      j.ImportDeclaration,
      (path) => path.source.value === '@fluentui/react-native' || path.source.value === '@fluentui-react-native/checkbox',
    )
    .forEach((path) => {
      path.value.specifiers.forEach((specifier) => {
        if (specifier.imported.name === 'Checkbox') {
          specifier.imported = 'CheckboxV1';
          specifier.local.name = 'Checkbox';
        }
      });
    });

  // Make more robust?
  root
    .find(j.ImportDeclaration, (path) => path.source.value === '@fluentui-react-native/checkbox-experimental')
    .forEach((path) => {
      path.source.value = '@fluentui/react-native';
    });

  // Do we need to add more import checks?

  // Migrate props
  root.findJSXElements('Checkbox').forEach((path) => {
    path.value.openingElement.attributes.forEach((attribute) => {
      console.log(attribute);

      if (attribute.name.name === 'ariaLabel') {
        attribute.name.name = 'accessibilityLabel';
      }

      if (attribute.name.name === 'boxSide') {
        if (attribute.value.value === 'start') {
          attribute.name.name = 'labelPosition';
          attribute.value.value = 'after';
        }
        if (attribute.value.value === 'end') {
          attribute.name.name = 'labelPosition';
          attribute.value.value = 'end';
        }
      }
    });
  });

  // tokens?????

  return root.toSource(printOptions);
};
