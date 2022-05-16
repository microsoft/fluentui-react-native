module.exports = function (fileInfo, api, options) {
  const j = api.jscodeshift;

  const printOptions = options.printOptions || {
    quote: 'single',
    trailingComma: true,
  };

  const root = j(fileInfo.source);

  root.findJSXElements('ButtonV1').forEach((path) => {
    path.value.openingElement.name = 'Button';
    path.value.closingElement.name = 'Button';
  });

  root
    .find(
      j.ImportDeclaration,
      (path) => path.source.value === '@fluentui/react-native' || path.source.value === '@fluentui-react-native/button',
    )
    .forEach((path) => {
      path.value.specifiers.forEach((specifier) => {
        console.log(specifier);
        if (specifier.imported.name === 'ButtonV1') {
          specifier.imported = 'Button';
          specifier.local = '';
        }
      });
    });

  root
    .find(j.Identifier, {
      name: 'ButtonV1',
    })
    .forEach((path) => {
      path.value.name = 'Button';
    });

  return root.toSource(printOptions);
};
