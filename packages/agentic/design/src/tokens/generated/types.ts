export type GeneratedDelta<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? {
        [Key in keyof T]?: GeneratedDelta<T[Key]>;
      }
    : T;

export type GeneratedValueDefinition<T, Name extends string> =
  | {
      readonly value: () => T;
    }
  | {
      readonly parent: Name;
      readonly delta: () => GeneratedDelta<T>;
      readonly deletedPaths?: readonly string[];
    };

export type GeneratedValueDefinitions<T, Name extends string> = Readonly<Record<Name, GeneratedValueDefinition<T, Name>>>;
