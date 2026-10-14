import * as React from 'react';
import { act } from 'react';
import * as renderer from 'react-test-renderer';

import type { MenuItemInfo } from './MenuItem.types';
import { useMenuItem } from './useMenuItem';

describe('useMenuItem focus ring (win32)', () => {
  let info: MenuItemInfo;
  const Probe = () => {
    info = useMenuItem({ componentRef: React.useRef({ focus: jest.fn(), blur: jest.fn() } as any) });
    return null;
  };

  beforeEach(() => {
    act(() => {
      renderer.create(<Probe />);
    });
  });

  it('keeps the focus ring hidden when hover moves focus before React re-renders', () => {
    // Simulate the native focus event firing with the handlers from the same render as onHoverIn.
    const { onHoverIn, onFocus } = info.props;
    act(() => {
      onHoverIn({} as any);
      onFocus({} as any);
    });
    expect(info.props.enableFocusRing).toBe(false);
  });

  it('shows the focus ring for a keyboard focus after a hover focus', () => {
    act(() => {
      info.props.onHoverIn({} as any);
    });
    act(() => {
      info.props.onFocus({} as any);
    });
    expect(info.props.enableFocusRing).toBe(false);

    act(() => {
      info.props.onBlur({} as any);
    });
    act(() => {
      info.props.onHoverOut({} as any);
    });
    act(() => {
      info.props.onFocus({} as any);
    });
    expect(info.props.enableFocusRing).toBe(true);
  });
});
