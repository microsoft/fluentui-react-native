import { mapObjectFromObject } from './objects';

describe('mapObjectFromObject', () => {
  it('projects nested source values into nested destination paths', () => {
    const source = {
      theme: {
        colors: {
          background: '#123456',
        },
      },
      count: 0,
      enabled: false,
      empty: '',
      nullable: null,
    };

    expect(
      mapObjectFromObject(source, {
        'color.background': 'theme.colors.background',
        'metadata.count': 'count',
        'metadata.enabled': 'enabled',
        'metadata.empty': 'empty',
        'metadata.nullable': 'nullable',
        'metadata.missing': 'theme.colors.missing',
      }),
    ).toEqual({
      color: {
        background: '#123456',
      },
      metadata: {
        count: 0,
        enabled: false,
        empty: '',
        nullable: null,
      },
    });
  });

  it('rejects conflicting and unsafe destination paths', () => {
    expect(() =>
      mapObjectFromObject(
        { first: 'value', second: 'nested' },
        {
          result: 'first',
          'result.child': 'second',
        },
      ),
    ).toThrow('is not an object');
    expect(() =>
      mapObjectFromObject(
        { first: 'value', second: 'nested' },
        {
          'result.child': 'second',
          result: 'first',
        },
      ),
    ).toThrow('is already defined');

    expect(() => mapObjectFromObject({ value: true }, { 'result.__proto__.polluted': 'value' })).toThrow('Unsafe destination path');
  });
});
