import type { LabelProps } from '../../index';

describe('Label props', () => {
  it('only accepts owner operations for a bound label', () => {
    const editor: LabelProps = { content: 'Project', target: { kind: 'editor', focus: () => {} } };
    // @ts-expect-error A group cannot invoke an option.
    const group: LabelProps = { content: 'Choices', target: { kind: 'group', activate: () => {} } };
    expect([editor, group]).toHaveLength(2);
  });
});
