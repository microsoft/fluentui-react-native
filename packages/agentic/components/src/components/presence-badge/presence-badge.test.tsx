import { StyleSheet } from 'react-native';
import { render } from '../../common/renderWithTheme';
import { PresenceBadge } from './presence-badge';
import type { PresenceBadgeStatus } from './presence-badge.types';

describe('PresenceBadge', () => {
  const hidden = { includeHiddenElements: true };
  it('changes the actual artwork without creating an accessible or hit-test target', async () => {
    const statuses: PresenceBadgeStatus[] = ['available', 'busy', 'doNotDisturb', 'away', 'offline', 'outOfOffice'];
    const tree = await render(<PresenceBadge status="available" testID="presence" />);
    const art = new Set<string>();
    for (const status of statuses) {
      await tree.rerender(<PresenceBadge status={status} testID="presence" />);
      const root = tree.getByTestId('presence', hidden);
      expect(root.props).toMatchObject({ accessibilityElementsHidden: true, accessible: false, pointerEvents: 'none' });
      const paths = root.queryAll((node) => node.type === 'RNSVGPath');
      expect(paths.length).toBeGreaterThan(0);
      art.add(paths.map((node) => node.props.d).join(';'));
    }
    expect(art.size).toBe(6);
  });

  it.each([
    ['extraSmall', 10],
    ['small', 12],
    ['medium', 16],
    ['large', 20],
  ] as const)('keeps the %s frame square', async (size, width) => {
    const tree = await render(<PresenceBadge size={size} testID="presence" />);
    expect(StyleSheet.flatten(tree.getByTestId('presence', hidden).props.style)).toMatchObject({ width, height: width });
  });
});
