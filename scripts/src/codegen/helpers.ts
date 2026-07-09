import type { CodegenTargetFile, FileOptions } from './types.ts';
import path from 'node:path';

export function writeCommentBlock(lines: string[], indent: string = ''): string {
  let commentBlock = `${indent}/**\n`;
  for (const line of lines) {
    commentBlock += `${indent} * ${line}\n`;
  }
  commentBlock += `${indent} */\n`;
  return commentBlock;
}

export function writeCommentLine(line: string, indent: string = ''): string {
  return `${indent}// ${line}\n`;
}

/**
 * Write a comment block or line based on the content of the comment. If the comment contains newlines or if
 * alwaysBlock is true, a block comment will be written. Otherwise, a single line comment will be written.
 * @param comment
 * @param indent
 * @param alwaysBlock
 * @returns
 */
export function writeComment(comment: string, indent: string = '', alwaysBlock = true): string {
  if (comment.includes('\n') || alwaysBlock) {
    return writeCommentBlock(comment.split('\n'), indent);
  }
  return writeCommentLine(comment, indent);
}

export function initTargetFile(filePath: string, description?: string): CodegenTargetFile {
  // resolve the file path
  return {
    filePath: path.resolve(filePath),
    description,
    constants: {},
    reExports: {},
  };
}

/**
 * Given two filenames, return the relative path from the first file to the second file, suitable for use in an import or export statement.
 * @param thisPath The path of the file that will import or export the other file.
 * @param refPath The path of the file to be imported or exported.
 * @param options Optional settings for generating the import/export path.
 * @returns The relative path from thisPath to refPath, formatted for use in an import or export statement.
 */
export function getImportExportPath(thisPath: string, refPath: string, options?: FileOptions): string {
  const includeExt = options?.includeImportExt ?? false;
  const fromPath = path.dirname(thisPath);
  let relativePath = path.relative(fromPath, refPath);
  // strip the extension if not including it
  if (!includeExt) {
    const ext = path.extname(relativePath);
    if (ext) {
      relativePath = relativePath.slice(0, -ext.length);
    }
  }
  // normalize to forward slashes for import/export paths
  relativePath = relativePath.replaceAll('\\', '/');
  // ensure the path starts with ./ or ../
  if (!relativePath.startsWith('.')) {
    relativePath = `./${relativePath}`;
  }
  return relativePath;
}
