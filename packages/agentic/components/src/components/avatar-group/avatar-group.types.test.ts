import type { AvatarGroupMember, AvatarGroupProps } from '../../index';

describe('AvatarGroup props', () => {
  it('accepts identity data without exposing replacement content or a group action', () => {
    const member: AvatarGroupMember = { key: 'ada', name: 'Ada', avatar: { initials: 'AD' } };
    // @ts-expect-error Member artwork cannot install an action on its native root.
    const action: AvatarGroupMember = { ...member, avatar: { initials: 'AD', onPress: () => {} } };
    // @ts-expect-error Stack masking is not a supported layout.
    const stack: AvatarGroupProps = { members: [member], layout: 'stack' };
    expect([member, action, stack]).toHaveLength(3);
  });
});
