/** A primitive constant value that can be emitted as a `const` export. */
export type ConstValue = string | number | boolean;

/** Options controlling how codegen output files are formatted and how import/export paths are generated. */
export type FileOptions = {
  /** Whether to keep the file extension on generated import/export paths. Defaults to false. */
  includeImportExt?: boolean;
  /** Number of spaces used for indentation in multi-line output. Defaults to 2. */
  tabWidth?: number;
  /** Maximum line length before a re-export statement is wrapped onto multiple lines. Defaults to 140. */
  lineWidth?: number;
  /** When true, emit block comments even for single-line content. Defaults to true. */
  alwaysBlockComments?: boolean;
};

/**
 * A collection of constant values, keyed by the exported constant name.
 */
export type Constants = Record<string, ConstValue>;

/** A `re-export` statement to emit: the set of names to re-export and an optional descriptive comment. */
export type ReExports = {
  /** The constant names to re-export from the source module. */
  values: Set<string>;
  /** Optional comment written above the re-export statement. */
  description?: string;
};

/**
 * An in-memory description of a single file to be generated. It carries the constants to declare directly and any
 * constants that should instead be re-exported from other generated files.
 */
export type CodegenTargetFile = {
  /** Absolute path of the file to write. */
  filePath: string;
  /** Optional header comment written at the top of the file. */
  description?: string;

  /** Optional comment written above the block of `const` exports. */
  constantsDescription?: string;
  /** Constants declared directly in this file as `const` exports. */
  constants: Constants;
  /** Constants re-exported from other files, keyed by the relative module path to re-export from. */
  reExports?: Record<string, ReExports>;
};
