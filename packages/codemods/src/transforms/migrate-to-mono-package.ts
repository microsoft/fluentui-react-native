import type { Transform, JSCodeshift, FileInfo, API, Options, ASTPath, ImportDeclaration } from 'jscodeshift';

import { BARREL_PACKAGE, MONO_PACKAGE_NAME, MONO_PACKAGE_SUBPATHS } from './mono-package-constants';

/**
 * Maps every named export from `@fluentui/react-native` barrel to its source package.
 * Generated from packages/libraries/core/src/index.ts.
 */
const BARREL_EXPORT_MAP: Record<string, string> = {
  Body1: 'text',
  Body1Strong: 'text',
  Body2: 'text',
  Body2Strong: 'text',
  buildRootStyles: 'persona-coin',
  Button: 'button',
  ButtonAppearance: 'button',
  ButtonCoreProps: 'button',
  ButtonCoreTokens: 'button',
  ButtonInfo: 'button',
  buttonLookup: 'button',
  buttonName: 'button',
  buttonNameV1: 'button',
  ButtonProps: 'button',
  ButtonShape: 'button',
  ButtonSize: 'button',
  ButtonSlotProps: 'button',
  ButtonTokens: 'button',
  ButtonType: 'button',
  ButtonV1: 'button',
  Callout: 'callout',
  calloutName: 'callout',
  CalloutNativeCommands: 'callout',
  Caption1: 'text',
  Caption1Strong: 'text',
  Caption2: 'text',
  Checkbox: 'checkbox',
  CheckboxInfo: 'checkbox',
  checkboxName: 'checkbox',
  checkboxNameV1: 'checkbox',
  CheckboxProps: 'checkbox',
  CheckboxShape: 'checkbox',
  CheckboxSize: 'checkbox',
  CheckboxSlotProps: 'checkbox',
  CheckboxState: 'checkbox',
  CheckboxTokens: 'checkbox',
  CheckboxType: 'checkbox',
  CheckboxV1: 'checkbox',
  CMContext: 'contextual-menu',
  CompoundButton: 'button',
  compoundButtonName: 'button',
  CompoundButtonProps: 'button',
  CompoundButtonSlotProps: 'button',
  CompoundButtonTokens: 'button',
  CompoundButtonType: 'button',
  ContextualMenu: 'contextual-menu',
  ContextualMenuContext: 'contextual-menu',
  ContextualMenuItem: 'contextual-menu',
  contextualMenuItemName: 'contextual-menu',
  ContextualMenuItemProps: 'contextual-menu',
  ContextualMenuItemRenderData: 'contextual-menu',
  ContextualMenuItemSlotProps: 'contextual-menu',
  ContextualMenuItemState: 'contextual-menu',
  ContextualMenuItemTokens: 'contextual-menu',
  ContextualMenuItemType: 'contextual-menu',
  contextualMenuName: 'contextual-menu',
  ContextualMenuProps: 'contextual-menu',
  ContextualMenuRenderData: 'contextual-menu',
  ContextualMenuSlotProps: 'contextual-menu',
  ContextualMenuState: 'contextual-menu',
  ContextualMenuTokens: 'contextual-menu',
  ContextualMenuType: 'contextual-menu',
  defaultLinkTokens: 'link',
  DirectionalHint: 'callout',
  DismissBehaviors: 'callout',
  Display: 'text',
  FAB: 'button',
  fabName: 'button',
  FABProps: 'button',
  FABSize: 'button',
  FABSlotProps: 'button',
  FABTokens: 'button',
  FABType: 'button',
  filterOutComponentRef: 'focus-trap-zone',
  FocusTrapZone: 'focus-trap-zone',
  FocusZone: 'focus-zone',
  FocusZoneDirection: 'focus-zone',
  focusZoneName: 'focus-zone',
  FocusZoneProps: 'focus-zone',
  FocusZoneRenderData: 'focus-zone',
  FocusZoneSlotProps: 'focus-zone',
  FocusZoneState: 'focus-zone',
  FocusZoneTabNavigation: 'focus-zone',
  FocusZoneTokens: 'focus-zone',
  FocusZoneType: 'focus-zone',
  getAccessibilityState: 'interactive-hooks',
  getFocusBorderStyle: 'button',
  IButtonInfo: 'button',
  IButtonProps: 'button',
  IButtonRenderData: 'button',
  IButtonSlotProps: 'button',
  IButtonState: 'button',
  IButtonTokens: 'button',
  IButtonType: 'button',
  ICalloutProps: 'callout',
  ICalloutRenderData: 'callout',
  ICalloutSlotProps: 'callout',
  ICalloutTokens: 'callout',
  ICallotType: 'callout',
  ICheckboxProps: 'checkbox',
  ICheckboxRenderData: 'checkbox',
  ICheckboxSlotProps: 'checkbox',
  ICheckboxState: 'checkbox',
  ICheckboxTokens: 'checkbox',
  ICheckboxType: 'checkbox',
  IChildAsFunction: 'pressable',
  IconAlignment: 'persona-coin',
  IFocusable: 'interactive-hooks',
  IFocusState: 'interactive-hooks',
  IFocusTrapZoneProps: 'focus-trap-zone',
  IFocusTrapZoneSlotProps: 'focus-trap-zone',
  IFocusTrapZoneType: 'focus-trap-zone',
  IHoverState: 'interactive-hooks',
  ILinkHooks: 'link',
  ILinkInfo: 'link',
  ILinkOptions: 'link',
  ILinkProps: 'link',
  ILinkRenderData: 'link',
  ILinkSlotProps: 'link',
  ILinkState: 'link',
  ILinkTokens: 'link',
  ILinkType: 'link',
  InteractionEvent: 'interactive-hooks',
  IPersonaCoinProps: 'persona-coin',
  IPersonaCoinRenderData: 'persona-coin',
  IPersonaCoinSlotProps: 'persona-coin',
  IPersonaCoinState: 'persona-coin',
  IPersonaCoinTokens: 'persona-coin',
  IPersonaCoinType: 'persona-coin',
  IPersonaConfigurableProps: 'persona-coin',
  IPersonaProps: 'persona',
  IPersonaRenderData: 'persona',
  IPersonaSlotProps: 'persona',
  IPersonaState: 'persona',
  IPersonaTokens: 'persona',
  IPersonaType: 'persona',
  IPressableHooks: 'interactive-hooks',
  IPressableOptions: 'interactive-hooks',
  IPressableProps: 'pressable',
  IPressableState: 'interactive-hooks',
  IPressableType: 'pressable',
  IPressState: 'interactive-hooks',
  IRadioButtonProps: 'radio-group',
  IRadioButtonRenderData: 'radio-group',
  IRadioButtonSlotProps: 'radio-group',
  IRadioButtonTokens: 'radio-group',
  IRadioButtonType: 'radio-group',
  IRadioGroupContext: 'radio-group',
  IRadioGroupProps: 'radio-group',
  IRadioGroupRenderData: 'radio-group',
  IRadioGroupSlotProps: 'radio-group',
  IRadioGroupState: 'radio-group',
  IRadioGroupTokens: 'radio-group',
  IRadioGroupType: 'radio-group',
  IRenderChild: 'pressable',
  IRenderStyle: 'pressable',
  isAccessibilityActionEvent: 'interactive-hooks',
  isGestureResponderEvent: 'interactive-hooks',
  isKeyPressEvent: 'interactive-hooks',
  isMouseEvent: 'interactive-hooks',
  ITextProps: 'text',
  ITextType: 'text',
  IWithLinkOptions: 'link',
  IWithPressableEvents: 'interactive-hooks',
  IWithPressableOptions: 'interactive-hooks',
  KeyCallback: 'interactive-hooks',
  KeyPressEvent: 'interactive-hooks',
  LargeTitle: 'text',
  Link: 'link',
  LinkAppearance: 'link',
  linkLookup: 'link',
  linkName: 'link',
  linkNameV1: 'link',
  LinkProps: 'link',
  LinkSlotProps: 'link',
  LinkState: 'link',
  linkStates: 'link',
  linkStylingSettings: 'link',
  LinkTokens: 'link',
  LinkType: 'link',
  LinkV1: 'link',
  MenuButton: 'menu-button',
  MenuButtonContext: 'menu-button',
  MenuButtonItemProps: 'menu-button',
  MenuButtonName: 'menu-button',
  MenuButtonProps: 'menu-button',
  MenuButtonRenderData: 'menu-button',
  MenuButtonSlotProps: 'menu-button',
  MenuButtonState: 'menu-button',
  MenuButtonTokens: 'menu-button',
  MenuButtonType: 'menu-button',
  NativeProps: 'focus-zone',
  NavigateAtEnd: 'focus-zone',
  OnChangeCallback: 'interactive-hooks',
  onKeySelectCallback: 'interactive-hooks',
  OnPressCallback: 'interactive-hooks',
  OnPressWithFocusCallback: 'interactive-hooks',
  OnToggleCallback: 'interactive-hooks',
  Persona: 'persona',
  PersonaCoin: 'persona-coin',
  PersonaCoinColor: 'persona-coin',
  PersonaCoinFluentColor: 'persona-coin',
  personaCoinName: 'persona-coin',
  personaName: 'persona',
  PersonaPresence: 'persona-coin',
  PersonaSize: 'persona-coin',
  preferKeyDownForKeyEvents: 'interactive-hooks',
  Pressable: 'pressable',
  PressableFocusProps: 'interactive-hooks',
  PressableHoverProps: 'interactive-hooks',
  PressablePressProps: 'interactive-hooks',
  PressablePropsExtended: 'interactive-hooks',
  PrimaryButton: 'button',
  RadioButton: 'radio-group',
  radioButtonName: 'radio-group',
  RadioGroup: 'radio-group',
  RadioGroupContext: 'radio-group',
  radioGroupName: 'radio-group',
  RestoreFocusEvent: 'callout',
  RingConfig: 'persona-coin',
  RingThickness: 'persona-coin',
  Separator: 'separator',
  separatorName: 'separator',
  SeparatorProps: 'separator',
  SeparatorTokens: 'separator',
  SeparatorType: 'separator',
  StealthButton: 'button',
  Submenu: 'contextual-menu',
  SubmenuItem: 'contextual-menu',
  submenuItemName: 'contextual-menu',
  SubmenuItemProps: 'contextual-menu',
  SubmenuItemRenderData: 'contextual-menu',
  SubmenuItemSlotProps: 'contextual-menu',
  SubmenuItemState: 'contextual-menu',
  SubmenuItemTokens: 'contextual-menu',
  SubmenuItemType: 'contextual-menu',
  submenuName: 'contextual-menu',
  SubmenuProps: 'contextual-menu',
  SubmenuRenderData: 'contextual-menu',
  SubmenuSlotProps: 'contextual-menu',
  SubmenuState: 'contextual-menu',
  SubmenuTokens: 'contextual-menu',
  SubmenuType: 'contextual-menu',
  Subtitle1: 'text',
  Subtitle1Strong: 'text',
  Subtitle2: 'text',
  Subtitle2Strong: 'text',
  Tab: 'tablist',
  TabInfo: 'tablist',
  TabList: 'tablist',
  TabListInfo: 'tablist',
  tabListName: 'tablist',
  TabListProps: 'tablist',
  TabListSlotProps: 'tablist',
  TabListState: 'tablist',
  TabListTokens: 'tablist',
  TabListType: 'tablist',
  tabName: 'tablist',
  TabProps: 'tablist',
  TabSlotProps: 'tablist',
  TabState: 'tablist',
  TabTokens: 'tablist',
  TabType: 'tablist',
  Text: 'text',
  textName: 'text',
  textNameV1: 'text',
  TextProps: 'text',
  TextTokens: 'text',
  TextV1: 'text',
  Title1: 'text',
  Title1Strong: 'text',
  Title2: 'text',
  Title3: 'text',
  ToggleButton: 'button',
  ToggleButtonInfo: 'button',
  toggleButtonName: 'button',
  ToggleButtonProps: 'button',
  ToggleButtonSlotProps: 'button',
  ToggleButtonTokens: 'button',
  ToggleButtonType: 'button',
  useAsLink: 'link',
  useAsPressable: 'interactive-hooks',
  useAsToggle: 'interactive-hooks',
  useButton: 'button',
  useCheckbox: 'checkbox',
  useFocusState: 'interactive-hooks',
  useHoverState: 'interactive-hooks',
  useKeyDownProps: 'interactive-hooks',
  useKeyProps: 'interactive-hooks',
  useKeyUpProps: 'interactive-hooks',
  useLink: 'link',
  useOnPressWithFocus: 'interactive-hooks',
  usePressability: 'interactive-hooks',
  usePressableState: 'interactive-hooks',
  usePressState: 'interactive-hooks',
  useSelectedKey: 'interactive-hooks',
  useToggleButton: 'button',
  useViewCommandFocus: 'interactive-hooks',
};

/**
 * Matches `@fluentui-react-native/<name>` with optional trailing slash.
 */
const FURN_SCOPED_RE = /^@fluentui-react-native\/([^/]+)\/?$/;

/**
 * Matches `@uifabricshared/<name>` with optional trailing slash.
 */
const UIFABRIC_SCOPED_RE = /^@uifabricshared\/([^/]+)\/?$/;

/**
 * jscodeshift transform that migrates imports to the unified `fluentui-react-native/*` mono-package.
 *
 * Handles three source patterns:
 * 1. `@fluentui-react-native/<pkg>` → `fluentui-react-native/<pkg>`
 * 2. `@uifabricshared/<pkg>` → `fluentui-react-native/<pkg>`
 * 3. `@fluentui/react-native` (barrel) → split into per-package `fluentui-react-native/<pkg>` imports
 *
 * Packages not in the mono-package (e.g. e2e-testing, scripts) are left untouched.
 * Barrel imports with unrecognized names are left as-is.
 */
export const transform: Transform = (fileInfo: FileInfo, api: API, options: Options) => {
  const j: JSCodeshift = api.jscodeshift;

  const printOptions = options.printOptions || {
    printWidth: 140,
    quote: 'single',
    tabWidth: 2,
    trailingComma: true,
  };

  const root = j(fileInfo.source);
  let hasChanges = false;

  // --- Phase 1: Decompose @fluentui/react-native barrel imports ---
  const barrelImports = root.find(j.ImportDeclaration, (node: ImportDeclaration) => node.source.value === BARREL_PACKAGE);

  barrelImports.forEach((path: ASTPath<ImportDeclaration>) => {
    const specifiers = path.value.specifiers;
    if (!specifiers || specifiers.length === 0) return;

    const isTypeOnly = path.value.importKind === 'type';

    // Group specifiers by target package
    const grouped = new Map<string, typeof specifiers>();
    const unknown: typeof specifiers = [];

    for (const spec of specifiers) {
      if (spec.type !== 'ImportSpecifier') {
        unknown.push(spec);
        continue;
      }

      const importedName = spec.imported.type === 'Identifier' ? spec.imported.name : undefined;
      if (!importedName) {
        unknown.push(spec);
        continue;
      }

      const targetPkg = BARREL_EXPORT_MAP[importedName];
      if (!targetPkg) {
        unknown.push(spec);
        continue;
      }

      if (!grouped.has(targetPkg)) {
        grouped.set(targetPkg, []);
      }
      grouped.get(targetPkg)!.push(spec);
    }

    if (grouped.size === 0) return; // nothing we can map

    // Build replacement import declarations
    const newImports: ImportDeclaration[] = [];

    for (const [pkg, specs] of [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      const decl = j.importDeclaration(specs, j.literal(`${MONO_PACKAGE_NAME}/${pkg}`));
      if (isTypeOnly) {
        decl.importKind = 'type';
      }
      newImports.push(decl);
    }

    // If there are unrecognized specifiers, keep the original import with only those
    if (unknown.length > 0) {
      const kept = j.importDeclaration(unknown, j.literal(BARREL_PACKAGE));
      if (isTypeOnly) {
        kept.importKind = 'type';
      }
      newImports.push(kept);
    }

    // Replace the original import with the new ones
    j(path).replaceWith(newImports);
    hasChanges = true;
  });

  // --- Phase 2: Rewrite scoped @fluentui-react-native/* and @uifabricshared/* imports ---
  root.find(j.ImportDeclaration).forEach((path) => {
    const source = path.value.source.value;
    if (typeof source !== 'string') return;

    let match = source.match(FURN_SCOPED_RE);
    if (!match) {
      match = source.match(UIFABRIC_SCOPED_RE);
    }
    if (!match) return;

    const packageName = match[1];
    if (!MONO_PACKAGE_SUBPATHS.has(packageName)) return;

    path.value.source = j.literal(`${MONO_PACKAGE_NAME}/${packageName}`);
    hasChanges = true;
  });

  // --- Phase 3: Rewrite require() calls ---
  root
    .find(j.CallExpression, {
      callee: { name: 'require' },
    })
    .forEach((path) => {
      const args = path.value.arguments;
      if (args.length !== 1) return;

      const arg = args[0];
      if (arg.type !== 'StringLiteral' && arg.type !== 'Literal') return;

      const source = 'value' in arg ? String(arg.value) : undefined;
      if (!source) return;

      // Handle barrel require
      if (source === BARREL_PACKAGE) {
        // Can't decompose require() by name — just rewrite to the barrel-equivalent
        // Consumers using require('@fluentui/react-native') will need manual intervention
        // since we can't statically determine which names they destructure.
        return;
      }

      let match = source.match(FURN_SCOPED_RE);
      if (!match) {
        match = source.match(UIFABRIC_SCOPED_RE);
      }
      if (!match) return;

      const packageName = match[1];
      if (!MONO_PACKAGE_SUBPATHS.has(packageName)) return;

      args[0] = j.literal(`${MONO_PACKAGE_NAME}/${packageName}`);
      hasChanges = true;
    });

  return hasChanges ? root.toSource(printOptions) : undefined;
};

export default transform;
