module.exports = function (fileInfo, api, options) {
  const j = api.jscodeshift;

  const printOptions = options.printOptions || {
    quote: 'single',
    trailingComma: true,
  };

  const root = j(fileInfo.source);
  root.find(j.ImportDeclaration).forEach((path) => {
    path.value.specifiers.forEach((specifier) => {
      if (specifier.imported === 'CheckboxV1') {
        specifier.imported = 'Checkbox';
        specifier.local = '';
      }
    });
  });

  return root.toSource(printOptions);
};
