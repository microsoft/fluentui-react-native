import type { PresenceBadgeProps } from './presence-badge.types';

describe('PresenceBadge props', () => {
  it('only accepts availability and passive visual customization', () => {
    const available: PresenceBadgeProps = { size: 'extraSmall', status: 'away' };
    // @ts-expect-error General badge state is not availability.
    const blocked: PresenceBadgeProps = { status: 'warning' };
    // @ts-expect-error The identity owner, not the mark, handles activation.
    const active: PresenceBadgeProps = { onPress: () => {} };
    expect([available, blocked, active]).toHaveLength(3);
  });
});
