import { act } from 'react';
import { Image, Text, View } from 'react-native';

import * as renderer from 'react-test-renderer';

import { Avatar, getAvatarColorHash, getAvatarInitials, resolveAvatarColorName } from './Avatar';
import { avatarSizeTokens } from './Avatar.tokens';

describe('ComponentsV2 Avatar', () => {
  it('uses image accessibility semantics and derives initials', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Avatar name="Ada Lovelace" testID="avatar" />);
    });

    const root = component!.root.findByProps({ testID: 'avatar' });
    expect(root.props.accessibilityRole).toBe('image');
    expect(root.props.accessibilityLabel).toBe('Ada Lovelace');
    expect(component!.root.findByProps({ testID: 'avatar-initials' }).props.children).toBe('AL');
  });

  it('supports custom React nodes for icon and badge', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Avatar badge={<Text>badge</Text>} icon={<Text>icon</Text>} testID="avatar" />,
      );
    });

    expect(component!.root.findByProps({ testID: 'avatar-icon' }).findByType(Text).props.children).toBe('icon');
    expect(component!.root.findByProps({ testID: 'avatar-badge' }).findByType(Text).props.children).toBe('badge');
  });

  it('falls back after an image error', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Avatar imageUrl="https://example.test/avatar.png" name="Grace Hopper" testID="avatar" />);
    });

    act(() => component!.root.findByType(Image).props.onError({ nativeEvent: {} }));
    expect(component!.root.findAllByType(Image)).toHaveLength(0);
    expect(component!.root.findByProps({ testID: 'avatar-initials' }).props.children).toBe('GH');
  });

  it('uses explicit size and active appearance tokens', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Avatar active="active" activeAppearance="ring-shadow" size={128} testID="avatar" />);
    });

    const root = component!.root.findByProps({ testID: 'avatar' });
    expect(root.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ height: 144, width: 144 })]));
    expect(component!.root.findAllByType(View).length).toBeGreaterThan(1);
  });

  it('uses the Web XOR-rotate hash deterministically', () => {
    expect(getAvatarColorHash('Ada Lovelace')).toBe(9219);
    expect(resolveAvatarColorName('stable-id', 'One')).toBe(resolveAvatarColorName('stable-id', 'Two'));
    expect(resolveAvatarColorName(undefined, 'Katri Athokas')).toBe('lilac');
    expect(resolveAvatarColorName(undefined, 'Elvia Atkins')).toBe('gold');
    expect(resolveAvatarColorName(undefined, 'Cameron Evans')).toBe('darkRed');
    expect(getAvatarInitials('Cher')).toBe('CH');
  });

  it('defines tokens for every supported size', () => {
    expect(Object.keys(avatarSizeTokens).map(Number)).toEqual([
      16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 120, 128,
    ]);
  });
});
