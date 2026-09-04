/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { Text as NativeText } from 'react-native';

import { directComponent } from '@fluentui-react-native/framework-base';
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { Icon } from '../../primitives/icon/icon';
import type { IconElementProps } from '../../primitives/icon/icon.types';
import type { Link } from './link';
import type { LinkProps } from './link.types';

const TrailingIcon: SlotProp<typeof Icon> = { fontSource: { codepoint: 0x2197, fontFamily: 'Arial' } };
const Replacement = directComponent<IconElementProps>((props) => React.createElement(NativeText, props));

const LinkSlot: SlotProp<typeof Link> = {
  content: 'Open the invoice',
  icon: { as: Replacement, fontSource: { codepoint: 0x2197, fontFamily: 'Arial' } },
  onPress: () => undefined,
  url: 'https://example.com/invoice',
};

const LinkPropsAcceptance: LinkProps = {
  content: 'Open the invoice',
  disabled: false,
  icon: TrailingIcon,
  inline: false,
  onNavigationError: (error: unknown) => String(error),
  onPress: () => undefined,
  ref: React.createRef<NativeText>(),
  style: { opacity: 1 },
  typeSet: 'content',
  url: 'https://example.com/invoice',
};

const InlineLink: LinkProps = { content: 'privacy statement', inline: true };
const DelegatedLink: LinkProps = { content: 'Open settings', onPress: () => undefined };
const SuppressedLabel: LinkProps = { accessibilityLabel: 'Open the invoice', content: null };

// @ts-expect-error an image cannot render inside Link's native Text root
const InvalidImageIcon: LinkProps = { icon: { imageSource: { uri: 'external.png' } } };

// @ts-expect-error an SVG cannot render inside Link's native Text root
const InvalidSvgIcon: LinkProps = { icon: { svgSource: () => null } };

// @ts-expect-error the type set is a closed union
const InvalidTypeSet: LinkProps = { typeSet: 'display' };

// @ts-expect-error the destination is a string, not a parsed URL object
const InvalidUrl: LinkProps = { url: new URL('https://example.com') };

describe('Link types', () => {
  it('accepts the documented prop and slot combinations', () => {
    expect(LinkSlot).toBeDefined();
    expect(LinkPropsAcceptance).toBeDefined();
    expect(InlineLink).toBeDefined();
    expect(DelegatedLink).toBeDefined();
    expect(SuppressedLabel).toBeDefined();
    expect(InvalidImageIcon).toBeDefined();
    expect(InvalidSvgIcon).toBeDefined();
  });
});
