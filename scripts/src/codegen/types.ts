export type ConstValue = string | number | boolean;

export type FileOptions = {
  // source extension, defaults to what the entry file has
  srcExt?: string;
  // include import extensions, defaults to false
  includeImportExt?: boolean;
  // tab width, defaults to 2
  tabWidth?: number;
  // line width, defaults to 140
  lineWidth?: number;
  // use block comments for all comments, defaults to true
  alwaysBlockComments?: boolean;
};

/**
 * A collection of constant values
 */
export type Constants = Record<string, ConstValue>;

export type ReExports = {
  values: Set<string>;
  description?: string;
};

export type CodegenTargetFile = {
  filePath: string;
  description?: string;

  constantsDescription?: string;
  constants: Constants;
  reExports?: Record<string, ReExports>;
};
