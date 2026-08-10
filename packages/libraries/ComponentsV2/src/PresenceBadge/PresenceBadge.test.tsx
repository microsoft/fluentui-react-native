import { act } from 'react';
import { View } from 'react-native';

import * as renderer from 'react-test-renderer';
import { Path } from 'react-native-svg';

import { PresenceBadge, getPresenceBadgeAccessibilityLabel } from './PresenceBadge';
import { presenceBadgeIconPaths, resolvePresenceBadgeIcon } from './PresenceBadge.tokens';
import { presenceBadgeStatuses } from './PresenceBadge.types';

describe('ComponentsV2 PresenceBadge', () => {
  it('uses accessible image semantics and the available default', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<PresenceBadge testID="presence" />);
    });

    const root = component!.root.findByProps({ testID: 'presence' });
    expect(root.props.accessibilityRole).toBe('image');
    expect(root.props.accessibilityLabel).toBe('available');
    expect(root.props.accessible).toBe(true);
  });

  it.each(presenceBadgeStatuses)('provides a status label for %s', status => {
    expect(getPresenceBadgeAccessibilityLabel(status, false)).toBeTruthy();
  });

  it('adds the out-of-office modifier to the accessible label once', () => {
    expect(getPresenceBadgeAccessibilityLabel('available', true)).toBe('available out of office');
    expect(getPresenceBadgeAccessibilityLabel('out-of-office', true)).toBe('out of office');
  });

  it('uses Web presence dimensions for every size extreme', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<PresenceBadge size="extra-large" testID="presence" />);
    });
    expect(component!.root.findByProps({ testID: 'presence' }).props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderRadius: 14, borderWidth: 2, height: 28, width: 28 })]),
    );
  });

  it('maps out-of-office status combinations to their visual icons', () => {
    expect(resolvePresenceBadgeIcon('available', true)).toBe('available-out-of-office');
    expect(resolvePresenceBadgeIcon('away', true)).toBe('out-of-office');
    expect(resolvePresenceBadgeIcon('busy', true)).toBe('unknown');
    expect(resolvePresenceBadgeIcon('do-not-disturb', true)).toBe('do-not-disturb-out-of-office');
  });

  it('renders the resolved SVG path', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<PresenceBadge outOfOffice status="available" testID="presence" />);
    });
    expect(component!.root.findByType(Path).props.d).toBe(presenceBadgeIconPaths['available-out-of-office']);
    expect(component!.root.findByType(View)).toBeTruthy();
  });
});
