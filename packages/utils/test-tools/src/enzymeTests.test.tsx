import * as React from 'react';

import { checkRenderConsistency, checkReRender } from './enzymeTests';

const fixedStyle = {
  backgroundColor: 'blue',
  color: 'red',
};

const subStyle = {
  color: 'blue',
};

const Simple = (props) => {
  const { children, ...rest } = props;
  return (
    <span {...rest} style={fixedStyle}>
      {children}
    </span>
  );
};

const MultiLevel = (props) => {
  const { children, style, color, ...rest } = props;
  return (
    <div {...rest} style={style}>
      <span style={subStyle}>{children}</span>
      <span>{color}</span>
    </div>
  );
};

const MultiLevelBroken = (props) => {
  const { children, style, color, ...rest } = props;
  return (
    <div {...rest} style={style}>
      <span style={subStyle}>{children}</span>
      <span style={{ color: 'green' }}>{color}</span>
    </div>
  );
};

let renderCount = 0;

const SimpleWithHook = (props) => {
  const { children, ...rest } = props;
  const onKeyUp = React.useMemo(() => {
    console.log('something');
  }, []);
  renderCount++;
  return (
    <span {...rest} {...{ onKeyUp }} style={fixedStyle}>
      {children}
    </span>
  );
};

describe('enzyme component test validation', () => {
  it('renders the simple control twice', () => {
    checkRenderConsistency(() => <Simple>Hello</Simple>);
  });

  it('recurses into multi-level control correctly', () => {
    checkRenderConsistency(() => <MultiLevel>World</MultiLevel>, 2);
  });

  it('handles memoed functions', () => {
    const initialCount = renderCount;
    checkReRender(() => <SimpleWithHook>ReRender</SimpleWithHook>);
    expect(renderCount).toEqual(initialCount + 2);
  });

  it('catches a deep error for a broken multi-level component', () => {
    try {
      checkRenderConsistency(() => <MultiLevelBroken>Broken</MultiLevelBroken>, 2);
      expect('This should have detected an error').toBeFalse();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toContain('Shallow compare');
    }
  });
});
