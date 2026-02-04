import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { Badge, CounterBadge, PresenceBadge } from '../';

describe('Badge component tests', () => {
  const fontBuiltInProps = {
    fontFamily: 'Arial',
    codepoint: 0x2663,
    fontSize: 16,
  };
  it('Empty Badge', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Badge />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Badge all props', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Badge size="large" appearance="outline" shape="rounded" icon={{ fontSource: { ...fontBuiltInProps }, color: '#fff' }}>
          Badge
        </Badge>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Badge tokens', () => {
    const BadgeStyled = Badge.customize({
      backgroundColor: 'yellow',
      borderColor: '#f09',
      borderWidth: 4,
    });
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<BadgeStyled>Badge Tokens</BadgeStyled>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Filled badge with shadow', () => {
    const BadgeWithShadow = Badge.customize({
      shadowToken: { ambient: { x: 0, y: 0, blur: 8, color: '#00000033' }, key: { x: 0, y: 32, blur: 64, color: '#0000003d' } },
    });
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<BadgeWithShadow appearance="filled">Badge with shadow</BadgeWithShadow>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});

describe('PresenceBadge component tests', () => {
  it('PresenceBadge props', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<PresenceBadge size="large" status="available" outOfOffice={true} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});

describe('CounterBadge component tests', () => {
  const fontBuiltInProps = {
    fontFamily: 'Arial',
    codepoint: 0x2663,
    fontSize: 16,
  };
  it('Empty Badge', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<CounterBadge />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('CounterBadge all props', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <CounterBadge
          size="large"
          appearance="ghost"
          shape="rounded"
          icon={{ fontSource: { ...fontBuiltInProps }, color: '#fff' }}
          count={30}
        />,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('CounterBadge tokens', () => {
    const CounterBadgeStyled = CounterBadge.customize({
      backgroundColor: 'yellow',
      borderColor: '#f09',
      borderWidth: 4,
    });
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<CounterBadgeStyled count={70} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('CounterBadge shows 99+', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<CounterBadge count={100} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('CounterBadge shows 1000+', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<CounterBadge overflowCount={1000} count={2000} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('CounterBadge shows zero', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<CounterBadge count={0} showZero={true} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});
