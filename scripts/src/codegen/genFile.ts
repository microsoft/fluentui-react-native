import { FSEntry } from '@rnx-kit/tools-filesystem';
import type { FileOptions, CodegenTargetFile } from './types.ts';
import { writeComment } from './helpers.ts';
import { writeConstExports } from './constants.ts';

/** Default header comment placed at the top of generated files when a target has no explicit description. */
const defaultHeader = `WARNING: This file is auto-generated. Do not edit it manually.`;

/**
 * Write a {@link CodegenTargetFile} to disk. Emits the header comment, any directly-declared constants, and any
 * re-export statements (each grouped by source module and wrapped when they exceed the configured line width).
 * @param target The target file description to serialize.
 * @param options Formatting options (tab width, line width, comment style).
 */
export function outputCodegenFile(target: CodegenTargetFile, options: FileOptions = {}) {
  const { filePath, description = defaultHeader, constants, reExports } = target;
  const { tabWidth = 2, lineWidth = 140, alwaysBlockComments = true } = options;
  const entry = new FSEntry(filePath);
  let content = writeComment(description, '', alwaysBlockComments);

  if (constants && Object.keys(constants).length > 0) {
    content += '\n';
    content += writeConstExports(constants, target.constantsDescription);
  }

  if (reExports && Object.keys(reExports).length > 0) {
    const reExportKeys = Object.keys(reExports).sort();
    for (const key of reExportKeys) {
      const { values, description: reExportDescription } = reExports[key];
      content += '\n';
      content += writeComment(reExportDescription ?? `Re-exporting constants from ${key}`, '', alwaysBlockComments);
      content += writeReExports(key, Array.from(values).sort(), ' '.repeat(tabWidth), lineWidth);
    }
  }

  if (!content.endsWith('\n')) {
    content += '\n';
  }
  entry.content = content;
  entry.writeContentsSync();
}

/**
 * Build a single `export { ... } from '...'` statement. The statement is emitted on one line when it fits within
 * `lineWidth`, otherwise it is wrapped with one exported name per line.
 * @param from The module specifier to re-export from.
 * @param exports The constant names to re-export.
 * @param tab The indentation string used for each name when wrapping.
 * @param lineWidth The maximum single-line length before wrapping.
 * @returns The generated export statement, terminated with a newline.
 */
function writeReExports(from: string, exports: string[], tab: string, lineWidth: number) {
  // try single-line first
  let line = `export { ${exports.join(', ')} } from '${from}';\n`;
  if (line.length > lineWidth) {
    // multi-line
    line = 'export {\n';
    for (const exp of exports) {
      line += `${tab}${exp},\n`;
    }
    line += `} from '${from}';\n`;
  }
  return line;
}
