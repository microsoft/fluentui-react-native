import { act } from 'react';
import { Pressable, Text } from 'react-native';

import * as renderer from 'react-test-renderer';

import { Button, CompoundButton, MenuButton, SplitButton, ToggleButton } from './Button';

describe('ComponentsV2 Button family', () => {
  it('renders Button defaults with an inferred accessible label', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Button>Save</Button>);
    });

    const root = component!.root.findByType(Pressable);
    expect(root.props.accessibilityLabel).toBe('Save');
    expect(root.props.accessibilityRole).toBe('button');
    expect(root.props.accessibilityState).toEqual({ disabled: false });
    expect(root.props.focusable).toBe(true);
  });

  it('supports all visual variants, sizes, shapes, and icon positions', () => {
    const icon = <Text>+</Text>;
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <>
          <Button appearance="primary" icon={icon} shape="circular" size="small">
            Add
          </Button>
          <Button appearance="outline" icon={icon} iconPosition="after" shape="square" size="large">
            Next
          </Button>
          <Button appearance="subtle">Subtle</Button>
          <Button appearance="transparent">Transparent</Button>
        </>,
      );
    });

    const roots = component!.root.findAllByType(Pressable);
    expect(roots).toHaveLength(4);
    expect(roots[0].props.style[1].minHeight).toBe(24);
    expect(roots[1].props.style[1].minHeight).toBe(40);
    expect(roots[1].props.style[1].borderRadius).toBe(0);
  });

  it('infers icon-only sizing and keeps long labels unconstrained by line count', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <>
          <Button accessibilityLabel="Add" icon={<Text>+</Text>} />
          <Button>This intentionally long label remains available for native wrapping.</Button>
        </>,
      );
    });

    it('renders Fluent font icon sources used by the catalog', () => {
      let component: renderer.ReactTestRenderer;
      act(() => {
        component = renderer.create(
          <Button
            accessibilityLabel="Calendar"
            icon={{
              fontSource: {
                codepoint: 0xe787,
                fontFamily: 'Segoe Fluent Icons',
                fontSize: 16,
              },
            }}
          />,
        );
      });

      expect(component!.root.findByType(Text).children.join('')).toBe(String.fromCodePoint(0xe787));
    });

    const roots = component!.root.findAllByType(Pressable);
    expect(roots[0].props.style[1].width).toBe(32);
    expect(component!.root.findAllByType(Text)[1].props.numberOfLines).toBeUndefined();
  });

  it('blocks disabled and disabledFocusable activation while preserving disabledFocusable focus', () => {
    const onClick = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <>
          <Button disabled onClick={onClick}>
            Disabled
          </Button>
          <Button disabledFocusable onClick={onClick}>
            Focusable
          </Button>
        </>,
      );
    });

    const roots = component!.root.findAllByType(Pressable);
    expect(roots[0].props.focusable).toBe(false);
    expect(roots[1].props.focusable).toBe(true);
    expect(roots[1].props.accessibilityState.disabled).toBe(true);
    act(() => roots[1].props.onPress({ nativeEvent: {} }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders loading state as busy and prevents activation', () => {
    const onClick = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Button loading onClick={onClick}>
          Save
        </Button>,
      );
    });

    const root = component!.root.findByType(Pressable);
    expect(root.props.accessibilityState.busy).toBe(true);
    expect(root.props.accessibilityState.disabled).toBe(true);
    act(() => root.props.onPress({ nativeEvent: {} }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders CompoundButton secondary content in its accessible name', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<CompoundButton secondaryContent="Share with your team">Share</CompoundButton>);
    });

    const root = component!.root.findByType(Pressable);
    expect(root.props.accessibilityLabel).toBe('Share Share with your team');
    expect(component!.root.findAllByType(Text).map((text) => text.children.join(''))).toEqual(['Share', 'Share with your team']);
  });

  it('exposes menu expansion state and a default menu affordance', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <MenuButton expanded menuIcon={<Text>More</Text>}>
          Options
        </MenuButton>,
      );
    });

    const root = component!.root.findByType(Pressable);
    expect(root.props.accessibilityState.expanded).toBe(true);
    expect(component!.root.findAllByType(Text).map((text) => text.children.join(''))).toContain('Options');
  });

  it('renders SplitButton actions separately and labels the menu action from the primary content', () => {
    const onPrimary = jest.fn();
    const onMenu = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <SplitButton expanded onClick={onPrimary} onMenuClick={onMenu} testID="send">
          Send
        </SplitButton>,
      );
    });

    const roots = component!.root.findAllByType(Pressable);
    expect(roots).toHaveLength(2);
    expect(roots[0].props.accessibilityLabel).toBe('Send');
    expect(roots[1].props.accessibilityLabel).toBe('More Send options');
    expect(roots[1].props.accessibilityState.expanded).toBe(true);
    act(() => {
      roots[0].props.onPress({ nativeEvent: {} });
      roots[1].props.onPress({ nativeEvent: {} });
    });
    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(onMenu).toHaveBeenCalledTimes(1);
  });

  it('updates ToggleButton uncontrolled state and supplies checked change data', () => {
    const onCheckedChange = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<ToggleButton onCheckedChange={onCheckedChange}>Bold</ToggleButton>);
    });

    const root = component!.root.findByType(Pressable);
    expect(root.props.accessibilityState.checked).toBe(false);
    act(() => root.props.onPress({ nativeEvent: {} }));
    expect(component!.root.findByType(Pressable).props.accessibilityState.checked).toBe(true);
    expect(onCheckedChange).toHaveBeenCalledWith(expect.anything(), { checked: true });
  });

  it('keeps ToggleButton controlled until its checked prop changes and supports accessible selected state', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <ToggleButton checked isAccessible>
          Bold
        </ToggleButton>,
      );
    });

    const root = component!.root.findByType(Pressable);
    expect(root.props.accessibilityState.checked).toBe(true);
    act(() => root.props.onPress({ nativeEvent: {} }));
    expect(component!.root.findByType(Pressable).props.accessibilityState.checked).toBe(true);
  });
});
