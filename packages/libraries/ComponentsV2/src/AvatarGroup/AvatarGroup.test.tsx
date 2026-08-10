import { act } from 'react';
import { Text, View } from 'react-native';

import * as renderer from 'react-test-renderer';

import {
  AvatarGroup,
  AvatarGroupItem,
  AvatarGroupOverflowIndicator,
  partitionAvatarGroupItems,
} from './AvatarGroup';

describe('ComponentsV2 AvatarGroup', () => {
  it('partitions spread and pie items', () => {
    expect(partitionAvatarGroupItems([1, 2, 3, 4, 5, 6])).toEqual({
      inlineItems: [3, 4, 5, 6],
      overflowItems: [1, 2],
    });
    expect(partitionAvatarGroupItems([1, 2, 3, 4], 2)).toEqual({
      inlineItems: [4],
      overflowItems: [1, 2, 3],
    });
    expect(partitionAvatarGroupItems([1, 2, 3, 4, 5], 5, 'pie')).toEqual({
      inlineItems: [1, 2, 3],
      overflowItems: [1, 2, 3, 4, 5],
    });
  });

  it('inherits size and generates a count overflow indicator', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <AvatarGroup maxItems={2} size={48} testID="group">
          <AvatarGroupItem name="One" testID="one" />
          <AvatarGroupItem name="Two" testID="two" />
          <AvatarGroupItem name="Three" testID="three" />
        </AvatarGroup>,
      );
    });

    expect(component!.root.findByProps({ testID: 'three' }).props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ height: 48, width: 48 })]),
    );
    expect(component!.root.findByProps({ testID: 'group-overflow' }).props.accessibilityLabel).toBe('2 more');

    act(() => component!.root.findByProps({ testID: 'group-overflow' }).props.onPress());

    expect(component!.root.findByProps({ testID: 'group-popover' })).toBeTruthy();
    expect(component!.root.findAllByType(Text).map(node => node.props.children)).toEqual(
      expect.arrayContaining(['One', 'Two']),
    );
  });

  it('supports icon indicators and tooltip accessibility/native title semantics', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <AvatarGroup size={32}>
          <AvatarGroupOverflowIndicator
            appearance="icon"
            icon={<Text>icon</Text>}
            testID="overflow"
            tooltip="Show more people"
          />
        </AvatarGroup>,
      );
    });

    const indicator = component!.root.findByProps({ testID: 'overflow' });
    expect(indicator.props.accessibilityHint).toBe('Show more people');
    expect(indicator.props.title).toBe('Show more people');
    expect(indicator.findByType(Text).props.children).toBe('icon');
  });

  it('caps pie layout at three visual segments', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <AvatarGroup layout="pie" testID="pie">
          <AvatarGroupItem name="One" />
          <AvatarGroupItem name="Two" />
          <AvatarGroupItem name="Three" />
          <AvatarGroupItem name="Four" />
        </AvatarGroup>,
      );
    });

    expect(
      component!.root.findAll(
        node => node.type === View && String(node.props.testID).startsWith('pie-pie-segment-'),
      ),
    ).toHaveLength(3);
    expect(component!.root.findByProps({ testID: 'pie-overflow' }).props.accessibilityLabel).toBe('4 more');
  });
});
