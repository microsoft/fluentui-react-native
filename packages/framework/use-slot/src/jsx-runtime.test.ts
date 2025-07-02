import * as React from 'react';

import { jsx, jsxs, Fragment } from './jsx-runtime';
import type { SlotFn } from './renderSlot';

// Mock React.createElement
const mockCreateElement = jest.fn();

// Store original createElement
const originalCreateElement = React.createElement;

describe('jsx-runtime', () => {
  beforeEach(() => {
    mockCreateElement.mockClear();
    mockCreateElement.mockImplementation((type, props, ...children) => ({
      type,
      props: {
        ...props,
        children: children.length === 0 ? undefined : children.length === 1 ? children[0] : children,
      },
      key: props?.key,
    }));

    // Replace React.createElement
    (React as any).createElement = mockCreateElement;
  });

  afterEach(() => {
    // Restore original
    (React as any).createElement = originalCreateElement;
  });

  describe('jsx function', () => {
    it('should call React.createElement for regular components', () => {
      const props = { title: 'Test' };
      jsx('div', props);

      expect(mockCreateElement).toHaveBeenCalledWith('div', props);
    });

    it('should call React.createElement for function components without _canCompose', () => {
      const TestComponent = (props: { title: string }) => originalCreateElement('div', null, props.title);
      const props = { title: 'Test' };

      jsx(TestComponent, props);

      expect(mockCreateElement).toHaveBeenCalledWith(TestComponent, props);
    });

    it('should call slot function directly for components with _canCompose', () => {
      const mockSlotFn = jest.fn().mockReturnValue({ type: 'div', props: { children: 'slot result' } });
      const SlotComponent: SlotFn<{ title: string }> = mockSlotFn;
      SlotComponent._canCompose = true;

      const props = { title: 'Test' };
      const result = jsx(SlotComponent, props);

      expect(mockSlotFn).toHaveBeenCalledWith(props);
      expect(mockCreateElement).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should include key in props when provided', () => {
      const props = { title: 'Test' };
      const key = 'test-key';

      jsx('div', props, key);

      expect(mockCreateElement).toHaveBeenCalledWith('div', { ...props, key });
    });
  });

  describe('jsxs function', () => {
    it('should behave the same as jsx function', () => {
      const props = { title: 'Test' };
      jsxs('div', props);

      expect(mockCreateElement).toHaveBeenCalledWith('div', props);
    });
  });

  describe('Fragment', () => {
    it('should create React Fragment with children', () => {
      const children = 'test children';
      Fragment({ children });

      expect(mockCreateElement).toHaveBeenCalledWith(React.Fragment, null, children);
    });

    it('should include key when provided', () => {
      const children = 'test children';
      const key = 'fragment-key';

      Fragment({ children, key });

      expect(mockCreateElement).toHaveBeenCalledWith(React.Fragment, { key }, children);
    });
  });
});
