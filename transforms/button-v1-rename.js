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
    .find(j.Identifier, {
      name: 'ButtonV1',
    })
    .forEach((path) => {
      path.value.name = 'Button';
    });

  return root.toSource(printOptions);
};
