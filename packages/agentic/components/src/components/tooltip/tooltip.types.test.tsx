import * as React from 'react';
import { View } from 'react-native';
import { Button, Checkbox, Dropdown, ToggleButton } from '../../index';
import { CompoundItemLayout } from '../../primitives/index';
import type { ButtonProps } from '../button/button.types';
import type { IconProps } from '../../primitives/icon/icon.types';
import { Tooltip } from './tooltip';

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

it('types direct view props and the single-element compatibility wrapper without augmenting React Native', () => {
  const ref = React.createRef<React.ComponentRef<typeof View>>();
  const stringOnly: Equal<ButtonProps['tooltip'], string | undefined> = true;
  // @ts-expect-error A polymorphic icon does not have a stable native View.
  const invalidIcon: IconProps = { tooltip: 'Icon tip' };
  const examples = (
    <>
      <Button tooltip="Button tip" />
      <Checkbox tooltip="Checkbox tip" />
      <Dropdown trigger={{ tooltip: 'Choose a value' }}>{null}</Dropdown>
      <ToggleButton content="Toggle" tooltip="Toggle tip" />
      <CompoundItemLayout primary={null} tooltip="Layout tip" />
      <Tooltip ref={ref} content="View tip">
        <View ref={ref} />
      </Tooltip>
      {/* @ts-expect-error FURN does not augment stock React Native's ViewProps. */}
      <View tooltip="View tip" />
      {/* @ts-expect-error A text node is not a tooltip anchor. */}
      <Tooltip content="Tip">not a view</Tooltip>
    </>
  );
  expect(React.isValidElement(examples)).toBe(true);
  expect(stringOnly).toBe(true);
  expect(invalidIcon).toBeDefined();
});
