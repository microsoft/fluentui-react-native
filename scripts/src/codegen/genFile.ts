import { FSEntry } from '@rnx-kit/tools-filesystem';
import type { FileOptions, CodegenTargetFile } from './types.ts';
import { writeComment } from './helpers.ts';
import { writeConstExports } from './constants.ts';

const defaultHeader = `WARNING: This file is auto-generated. Do not edit it manually.`;

/**
 * Output helper for codegen target files. Writes the file to disk with the specified options.
 * @param target The target file information.
 * @param options The file options.
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

function writeReExports(from: string, exports: string[], tab: string, lineWidth: number, exportType?: boolean) {
  // try single-line first
  let line = `export ${exportType ? 'type ' : ''}{ ${exports.join(', ')} } from '${from}';\n`;
  if (line.length > lineWidth) {
    // multi-line
    line = `export ${exportType ? 'type ' : ''}{\n`;
    for (const exp of exports) {
      line += `${tab}${exp},\n`;
    }
    line += `} from '${from}';\n`;
  }
  return line;
}
