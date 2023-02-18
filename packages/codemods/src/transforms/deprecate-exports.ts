import type { Transform, JSCodeshift, FileInfo, API, Options } from 'jscodeshift';

export const transform: Transform = (fileInfo: FileInfo, api: API, options: Options) => {
  const j: JSCodeshift = api.jscodeshift;

  const printOptions = options.printOptions || {
    printWidth: 140,
    quote: 'single',
    tabWidth: 2,
    trailingComma: true,
  };

  const root = j(fileInfo.source);
  const exportCollection = root.find(j.ExportNamedDeclaration);

  exportCollection.forEach((path) => {
    if (path.value.comments) {
      const comment = path.value.comments[path.value.comments.length - 1].value;
      if (!comment.includes('@deprecated')) {
        path.value.comments[path.value.comments.length - 1].value = comment + (comment.includes('\n') ? '' : '\r\n') + '* @deprecated\r\n ';
      }
    } else {
      path.value.comments = [j.commentBlock('*\r\n * @deprecated\r\n ')];
    }
  });

  return root.toSource(printOptions);
};

export default transform;
