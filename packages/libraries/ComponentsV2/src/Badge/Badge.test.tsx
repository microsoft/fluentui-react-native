import { act } from 'react';
import { Text, View } from 'react-native';

import * as renderer from 'react-test-renderer';

import { Badge } from './Badge';

describe('ComponentsV2 Badge', () => {
  it('uses Web-compatible defaults and compact text metrics', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Badge testID="badge">New</Badge>);
    });

    const root = component!.root.findByProps({ testID: 'badge' });
    expect(root.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderRadius: 10, height: 20, minWidth: 20, paddingHorizontal: 6 })]),
    );
    expect(component!.root.findByProps({ testID: 'badge-text' }).props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ fontSize: 12, height: 16, lineHeight: 16 })]),
    );
  });

  it('supports all geometry extremes', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Badge appearance="outline" shape="square" size="tiny" testID="badge" />);
    });

    expect(component!.root.findByProps({ testID: 'badge' }).props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderRadius: 0, borderWidth: 1, height: 6, minWidth: 6 })]),
    );
  });

  it('renders any React node as an icon after content', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Badge icon={<Text>icon</Text>} iconPosition="after" testID="badge">
          Label
        </Badge>,
      );
    });

    const children = component!.root.findByProps({ testID: 'badge' }).findAllByType(View);
    expect(component!.root.findByProps({ testID: 'badge-icon' }).findByType(Text).props.children).toBe('icon');
    expect(children.length).toBeGreaterThan(0);
  });

  it('preserves zero as visible content', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Badge testID="badge">{0}</Badge>);
    });
    expect(component!.root.findByProps({ testID: 'badge-text' }).props.children).toBe(0);
  });
});
