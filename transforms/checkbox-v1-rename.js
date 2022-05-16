module.exports = function (fileInfo, api, options) {
  const j = api.jscodeshift;

  const printOptions = options.printOptions || {
    quote: 'single',
    trailingComma: true,
  };

  const root = j(fileInfo.source);

  root.findJSXElements('CheckboxV1').forEach((path) => {
    path.value.openingElement.name = 'Checkbox';
    path.value.closingElement.name = 'Checkbox';
  });

  root
    .find(j.Identifier, {
      name: 'CheckboxV1',
    })
    .forEach((path) => {
      path.value.name = 'Checkbox';
    });

  return root.toSource(printOptions);
};
