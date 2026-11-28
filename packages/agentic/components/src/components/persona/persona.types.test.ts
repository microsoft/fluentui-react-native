import type { PersonaProps } from '../../index';

describe('Persona props', () => {
  it('takes localized presence without owning an activation handler', () => {
    const identity: PersonaProps = { name: 'Ana', presence: { status: 'away', label: 'Away' } };
    // @ts-expect-error Localized status is required when the artwork is informative.
    const missingStatus: PersonaProps = { name: 'Ana', presence: { status: 'away' } };
    // @ts-expect-error The enclosing action owns activation.
    const action: PersonaProps = { name: 'Ana', onPress: () => {} };
    expect([identity, missingStatus, action]).toHaveLength(3);
  });
});
