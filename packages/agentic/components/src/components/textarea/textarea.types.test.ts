import type { TextareaProps } from '../../index';

describe('Textarea props', () => {
  it('keeps single-line submission distinct from native editor customizations', () => {
    const props: TextareaProps = { accessibilityLabel: 'Comments', textInput: { maxLength: 400 } };
    // @ts-expect-error The value is not a paragraph array.
    const lines: TextareaProps = { value: ['One', 'Two'] };
    // @ts-expect-error The editor always owns Return as newline.
    const submit: TextareaProps = { textInput: { submitBehavior: 'submit' } };
    expect([props, lines, submit]).toHaveLength(3);
  });
});
