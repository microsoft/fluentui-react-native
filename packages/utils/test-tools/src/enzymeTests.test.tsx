import * as React from 'react';
import { renderTwiceAndCompare } from './enzymeTests';

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

describe('enzyme component test validation', () => {
  it('renders the simple control twice', () => {
    renderTwiceAndCompare(() => <Simple>Hello</Simple>);
  });

  it('recurses into multi-level control correctly', () => {
    renderTwiceAndCompare(() => <MultiLevel>World</MultiLevel>, 2);
  });

  it('catches a deep error for a broken multi-level component', () => {
    try {
      renderTwiceAndCompare(() => <MultiLevelBroken>Broken</MultiLevelBroken>, 2);
      expect('This should have detected an error').toBeFalse();
    } catch (e) {
      expect(e.message).toContain('Shallow compare');
    }
  });
});
