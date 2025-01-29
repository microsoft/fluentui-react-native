import * as React from 'react';

import * as renderer from 'react-test-renderer';

import { Badge, CounterBadge, PresenceBadge } from '../';

describe('Badge component tests', () => {
  const fontBuiltInProps = {
    fontFamily: 'Arial',
    codepoint: 0x2663,
    fontSize: 16,
  };
  it('Empty Badge', () => {
    const tree = renderer.create(<Badge />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Badge all props', () => {
    const tree = renderer
      .create(
        <Badge size="large" appearance="outline" shape="rounded" icon={{ fontSource: { ...fontBuiltInProps }, color: '#fff' }}>
          Badge
        </Badge>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Badge tokens', () => {
    const BadgeStyled = Badge.customize({
      backgroundColor: 'yellow',
      borderColor: '#f09',
      borderWidth: 4,
    });
    const tree = renderer.create(<BadgeStyled>Badge Tokens</BadgeStyled>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Filled badge with shadow', () => {
    const BadgeWithShadow = Badge.customize({
      shadowToken: { ambient: { x: 0, y: 0, blur: 8, color: '#00000033' }, key: { x: 0, y: 32, blur: 64, color: '#0000003d' } },
    });
    const tree = renderer.create(<BadgeWithShadow appearance="filled">Badge with shadow</BadgeWithShadow>).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('PresenceBadge component tests', () => {
  it('PresenceBadge props', () => {
    const tree = renderer.create(<PresenceBadge size="large" status="available" outOfOffice={true} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('CounterBadge component tests', () => {
  const fontBuiltInProps = {
    fontFamily: 'Arial',
    codepoint: 0x2663,
    fontSize: 16,
  };
  it('Empty Badge', () => {
    const tree = renderer.create(<CounterBadge />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('CounterBadge all props', () => {
    const tree = renderer
      .create(
        <CounterBadge
          size="large"
          appearance="ghost"
          shape="rounded"
          icon={{ fontSource: { ...fontBuiltInProps }, color: '#fff' }}
          count={30}
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('CounterBadge tokens', () => {
    const CounterBadgeStyled = CounterBadge.customize({
      backgroundColor: 'yellow',
      borderColor: '#f09',
      borderWidth: 4,
    });
    const tree = renderer.create(<CounterBadgeStyled count={70} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('CounterBadge shows 99+', () => {
    const tree = renderer.create(<CounterBadge count={100} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('CounterBadge shows 1000+', () => {
    const tree = renderer.create(<CounterBadge overflowCount={1000} count={2000} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('CounterBadge shows zero', () => {
    const tree = renderer.create(<CounterBadge count={0} showZero={true} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
