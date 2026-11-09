/**
 * Role and action heuristics for compact observations. Both providers normalize native roles into one vocabulary
 * (`native/PROTOCOL.md`), and these sets only decide what an outline shows. They never decide whether an action may
 * run: a mutation revalidates the element and its capability natively.
 */

/** Roles that a user operates, whatever actions the provider publishes for them. */
const interactiveRoles: ReadonlySet<string> = new Set([
  'button',
  'checkbox',
  'combobox',
  'link',
  'listitem',
  'menuitem',
  'radio',
  'row',
  'slider',
  'spinbutton',
  'splitbutton',
  'switch',
  'tab',
  'textbox',
  'treeitem',
]);

/** Roles whose structure is worth keeping as context even when they have no name. */
const structuralRoles: ReadonlySet<string> = new Set([
  'dialog',
  'document',
  'grid',
  'list',
  'menu',
  'menubar',
  'radiogroup',
  'status',
  'table',
  'tablist',
  'toolbar',
  'tree',
  'window',
]);

/** Roles that display state or labels. They are evidence when an observation asks for content. */
const contentRoles: ReadonlySet<string> = new Set(['image', 'progressbar', 'status', 'text', 'tooltip']);

/** Actions published for almost every element that say nothing about whether it is operable. */
const passiveActions: ReadonlySet<string> = new Set(['AXRaise', 'AXScrollToVisible', 'AXShowAlternateUI', 'AXShowDefaultUI', 'AXShowMenu']);

export type RoleSubject = {
  actions?: readonly string[];
  automationId?: string;
  name?: string;
  role: string;
  text?: string;
  value?: string;
};

export function hasActivationAction(actions: readonly string[] | undefined): boolean {
  return actions !== undefined && actions.some((action) => !passiveActions.has(action));
}

export function hasInteractiveRole(role: string): boolean {
  return interactiveRoles.has(role);
}

/** True for a node a user can operate: an operable role or a provider-published, non-passive action. */
export function isInteractive(subject: RoleSubject): boolean {
  return hasInteractiveRole(subject.role) || hasActivationAction(subject.actions);
}

/** Drops the actions published for almost every element, leaving the ones that say what the element does. */
export function activationActions(actions: readonly string[]): string[] {
  return actions.filter((action) => !passiveActions.has(action));
}

/** True for a node that shows something to read: a content role carrying a name, text, or value. */
export function isContent(subject: RoleSubject): boolean {
  return contentRoles.has(subject.role) && (isPresent(subject.name) || isPresent(subject.text) || isPresent(subject.value));
}

/** True for a container worth keeping as context: it is named, identified, or structurally meaningful. */
export function isLandmark(subject: RoleSubject): boolean {
  return structuralRoles.has(subject.role) || isPresent(subject.name) || isPresent(subject.automationId);
}

function isPresent(value: string | undefined): boolean {
  return value !== undefined && value.trim().length > 0;
}
