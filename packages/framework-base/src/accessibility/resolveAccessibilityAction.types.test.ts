import type { AccessibilityActionInfo, PressableProps } from 'react-native';
import { resolveAccessibilityAction } from '../index';
import type { SemanticAccessibilityAction } from '../index';

it('accepts readonly native declarations and produces native-compatible props', () => {
  const action: SemanticAccessibilityAction = 'toggle';
  const declarations: readonly AccessibilityActionInfo[] = [{ name: 'Toggle', label: 'Change' }, { name: 'custom' }];
  const result = resolveAccessibilityAction(action, 'windows', declarations);
  const props: Pick<PressableProps, 'accessibilityActions'> = { accessibilityActions: result.accessibilityActions };
  const eventName: string = result.name;
  expect(props.accessibilityActions).toEqual([{ name: eventName, label: 'Change' }, { name: 'custom' }]);
});

function unsupportedSemanticAction() {
  // @ts-expect-error Only demonstrated component-owned semantic actions belong in the resolver.
  resolveAccessibilityAction('activate', 'macos');
}

it.each(['expand', 'collapse'] as const)('accepts the public %s semantic action', (action) => {
  const semantic: SemanticAccessibilityAction = action;
  const result = resolveAccessibilityAction(semantic, 'windows');
  const props: Pick<PressableProps, 'accessibilityActions'> = { accessibilityActions: result.accessibilityActions };
  expect(props.accessibilityActions).toEqual([{ name: action }]);
});

void unsupportedSemanticAction;
