/**
 * Story identifier derivation.
 *
 * The generated manifest must agree with the identifiers the running Storybook app uses, so this
 * mirrors Storybook's own `sanitize` / `storyNameFromExport` / `toId` behaviour rather than
 * inventing a scheme.
 */

/** Storybook's `sanitize`: lowercase, collapse punctuation to single dashes, trim dashes. */
export function sanitizeStoryPart(value: string): string {
  const sanitized = value
    .toLowerCase()
    // eslint-disable-next-line no-useless-escape -- mirrors Storybook's own character class verbatim
    .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  if (sanitized === '') {
    throw new Error(`Invalid story title "${value}": it must contain alphanumeric characters`);
  }
  return sanitized;
}

/**
 * Storybook's `storyNameFromExport` / `toStartCaseStr`, ported verbatim.
 *
 * The rules are reproduced exactly — including the letter/digit boundary splits — because the
 * generated manifest must agree with the identifiers the running application uses. `Size24`
 * becomes `Size 24`, not `Size24`, and a divergence would make the manifest point at a story id
 * that does not exist.
 */
export function storyNameFromExport(exportName: string): string {
  return exportName
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\./g, ' ')
    .replace(/([^\n])([A-Z])([a-z])/g, (_match, first: string, second: string, third: string) => `${first} ${second}${third}`)
    .replace(/([a-z])([A-Z])/g, (_match, first: string, second: string) => `${first} ${second}`)
    .replace(/([a-z])([0-9])/gi, (_match, first: string, second: string) => `${first} ${second}`)
    .replace(/([0-9])([a-z])/gi, (_match, first: string, second: string) => `${first} ${second}`)
    .replace(/(\s|^)(\w)/g, (_match, whitespace: string, character: string) => `${whitespace}${character.toUpperCase()}`)
    .replace(/ +/g, ' ')
    .trim();
}

/** Storybook's `toId`: `<sanitized title>--<sanitized name>`. */
export function toStoryId(title: string, name: string): string {
  return `${sanitizeStoryPart(title)}--${sanitizeStoryPart(name)}`;
}

/** The stable tag embedded in a suite title so a run can grep exactly one story. */
export function storyTag(storyId: string): string {
  return `[story:${storyId}]`;
}

/** Escapes a story tag for use as a Mocha `--grep` regular expression. */
export function storyGrep(storyId: string): string {
  return storyTag(storyId).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
