import * as React from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { Divider } from '@fluentui-react-native/divider';
import { memoize, mergeProps, stagedComponent } from '@fluentui-react-native/framework';
import { Overflow, OverflowItem, OverflowTab, OverflowMenu, useOverflow, OverflowContext } from '@fluentui-react-native/overflow';
import type { OverflowProps } from '@fluentui-react-native/overflow';
import { TabList, type TabListProps } from '@fluentui-react-native/tablist';
import { TextV1 as Text } from '@fluentui-react-native/text';

import MoreHorizontalIcon from './MoreHorizontalFilled.svg';
import { Test } from '../Test';

const items = ['a', 'b', 'c'];

const containerStyle: ViewStyle = {
  paddingVertical: 4,
};

interface OverflowTabListProps extends TabListProps, OverflowProps {}

export const getOverflowStyleProps = memoize(overflowStylePropsWorker);
function overflowStylePropsWorker(dontHideBeforeReady: boolean, initialOverflowLayoutDone: boolean): Partial<OverflowProps> {
  return {
    style: {
      opacity: dontHideBeforeReady || initialOverflowLayoutDone ? 1 : 0,
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
  };
}

export const OverflowTabList = stagedComponent<OverflowTabListProps>((initial: OverflowTabListProps) => {
  const { props, state } = useOverflow(initial);
  return (final: OverflowTabListProps, ...children: React.ReactNode[]) => {
    const { itemIDs: _, ...mergedProps } = mergeProps(
      props,
      final,
      getOverflowStyleProps(props.dontHideBeforeReady, state.initialOverflowLayoutDone),
    );
    return (
      <OverflowContext.Provider value={state}>
        <TabList {...(mergedProps as any)}>{children}</TabList>
      </OverflowContext.Provider>
    );
  };
});
Overflow.displayName = 'OverflowTabList';

export function OverflowMainTest() {
  return (
    <View>
      <OverflowTabList itemIDs={items} size="small">
        {items.map((item) => (
          <OverflowTab tabKey={item} overflowID={item} key={item}>
            Item {' ' + item}
          </OverflowTab>
        ))}
        <OverflowMenu
          buttonProps={{
            iconOnly: true,
            icon: {
              svgSource: { src: MoreHorizontalIcon, viewBox: '0 0 20 20' },
            },
            children: null,
            appearance: 'subtle',
            style: {
              alignSelf: 'center',
            },
          }}
        />
      </OverflowTabList>
    </View>
  );
}

export function OverflowDifferentWidthTest() {
  return (
    <View>
      <Text variant="heroLargeStandard">Hidden Before Layout</Text>
      <View style={containerStyle}>
        <Text variant="headerSemibold">Width: 250</Text>
        <Overflow style={{ width: 250 }} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem overflowID={item} key={item}>
              Item {' ' + item}
            </OverflowItem>
          ))}
        </Overflow>
      </View>
      <View style={containerStyle}>
        <Text variant="headerSemibold">Width: 150</Text>
        <Overflow style={{ width: 150 }} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem overflowID={item} key={item}>
              Item {' ' + item}
            </OverflowItem>
          ))}
        </Overflow>
      </View>
      <View style={containerStyle}>
        <Text variant="headerSemibold">Width: 75</Text>
        <Overflow style={{ width: 75 }} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem overflowID={item} key={item}>
              Item {' ' + item}
            </OverflowItem>
          ))}
        </Overflow>
      </View>
      <Divider />
      <Text variant="heroLargeStandard">Visible Before Layout</Text>
      <View style={containerStyle}>
        <Text variant="headerSemibold">Width: 250</Text>
        <Overflow dontHideBeforeReady style={{ width: 250 }} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem overflowID={item} key={item}>
              Item {' ' + item}
            </OverflowItem>
          ))}
        </Overflow>
      </View>
      <View style={containerStyle}>
        <Text variant="headerSemibold">Width: 150</Text>
        <Overflow dontHideBeforeReady style={{ width: 150 }} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem overflowID={item} key={item}>
              Item {' ' + item}
            </OverflowItem>
          ))}
        </Overflow>
      </View>
      <View style={containerStyle}>
        <Text variant="headerSemibold" style={{ paddingVertical: 8 }}>
          Width: 75
        </Text>
        <Overflow dontHideBeforeReady style={{ width: 75 }} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem overflowID={item} key={item}>
              Item {' ' + item}
            </OverflowItem>
          ))}
        </Overflow>
      </View>
    </View>
  );
}

export const OverflowTest: React.FunctionComponent = () => {
  const description = 'A Divider is a visual separator that can contain content (text or an icon). Dividers can be horizontal or vertical';
  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/components/Divider/SPEC.md';

  return (
    <Test
      name="Divider Test"
      description={description}
      sections={[
        {
          name: 'Overflow',
          component: OverflowMainTest,
        },
      ]}
      spec={spec}
      status={{
        win32Status: 'Production',
        uwpStatus: 'Backlog',
        iosStatus: 'Production',
        macosStatus: 'Production',
        androidStatus: 'Production',
      }}
    />
  );
};
