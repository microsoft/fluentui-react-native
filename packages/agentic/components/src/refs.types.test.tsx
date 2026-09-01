/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import type { Image, Pressable, View } from 'react-native';
import { Text } from 'react-native';

import {
  Accordion,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Input,
  ListItem,
  ListboxItem,
  MenuItem,
  ProgressBar,
  Radio,
  Skeleton,
  Spinner,
  Switch,
  Tab,
  TabList,
  Tag,
} from './index';
import { CheckboxIndicator, CompoundItemLayout, FocusVisual, LayoutStableText } from './primitives/index';
import type { IconProps } from './primitives/index';

const pressableRef = React.createRef<React.ElementRef<typeof Pressable>>();
const viewRef = React.createRef<React.ElementRef<typeof View>>();
const imageRef = React.createRef<React.ElementRef<typeof Image>>();

function ComponentsWithNativeRootRefs() {
  return (
    <>
      <Accordion ref={viewRef} />
      <Avatar ref={viewRef} />
      <Badge ref={viewRef} />
      <Button ref={pressableRef} />
      <Card ref={viewRef} />
      <Checkbox ref={pressableRef} />
      <Divider ref={viewRef} />
      <Input ref={viewRef} />
      <ListItem ref={pressableRef} />
      <ListboxItem ref={pressableRef} />
      <MenuItem ref={pressableRef} />
      <ProgressBar ref={viewRef} />
      <Radio ref={pressableRef} />
      <Skeleton ref={viewRef} />
      <Spinner ref={viewRef} />
      <Switch ref={pressableRef} />
      <Tab controls="panel" ref={pressableRef} />
      <TabList ref={viewRef}>
        <Tab controls="panel" />
      </TabList>
      <Tag ref={pressableRef} />
    </>
  );
}

function PrimitivesWithStableNativeRootRefs() {
  return (
    <>
      <CheckboxIndicator ref={viewRef} />
      <CompoundItemLayout primary={null} ref={viewRef} />
      <FocusVisual ref={viewRef} />
      <LayoutStableText ref={viewRef} reserve={<Text />} visible={<Text />} />
    </>
  );
}

const IconWithoutStableNativeRootRef: IconProps = {
  imageSource: { uri: 'icon.png' },
  // @ts-expect-error Icon intentionally has no component ref because its renderer type varies by source.
  ref: imageRef,
};

describe('React 19 component ref types', () => {
  it('types stable native root refs and rejects Icon refs', () => {
    expect(ComponentsWithNativeRootRefs).toBeDefined();
    expect(PrimitivesWithStableNativeRootRefs).toBeDefined();
    expect(IconWithoutStableNativeRootRef).toBeDefined();
  });
});
