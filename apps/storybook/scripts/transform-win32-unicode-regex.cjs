const rewritePattern = require('regexpu-core');

function rewriteUnicodePropertyPattern(pattern, flags) {
  return rewritePattern(pattern, flags, {
    unicodeFlag: 'transform',
    unicodePropertyEscapes: 'transform',
  });
}

module.exports = ({ types }) => ({
  name: 'transform-win32-unicode-regex',
  visitor: {
    NewExpression(path) {
      const { arguments: args, callee } = path.node;
      if (
        types.isIdentifier(callee, { name: 'RegExp' }) &&
        types.isStringLiteral(args[0]) &&
        args[0].value.includes('\\p{') &&
        types.isStringLiteral(args[1]) &&
        args[1].value.includes('u')
      ) {
        const flags = args[1].value;
        path.replaceWith(
          types.newExpression(types.identifier('RegExp'), [
            types.stringLiteral(rewriteUnicodePropertyPattern(args[0].value, flags)),
            types.stringLiteral(flags.replace('u', '')),
          ]),
        );
      }
    },
    RegExpLiteral(path) {
      const { flags, pattern } = path.node;
      if (flags.includes('u') && pattern.includes('\\p{')) {
        path.replaceWith(types.regExpLiteral(rewriteUnicodePropertyPattern(pattern, flags), flags.replace('u', '')));
      }
    },
  },
});
