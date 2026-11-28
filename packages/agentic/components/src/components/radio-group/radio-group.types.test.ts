import type { RadioGroupProps } from '../../index';

describe('RadioGroup props', () => {
  it('accepts a controlled null selection and requires keyed options', () => {
    const valid: RadioGroupProps = { label: 'Delivery', value: null, options: [{ value: 'post', label: 'Post' }] };
    // @ts-expect-error The label cannot be used implicitly as a key.
    const invalid: RadioGroupProps = { ...valid, options: [{ label: 'Express' }] };
    expect([valid, invalid]).toHaveLength(2);
  });
});
