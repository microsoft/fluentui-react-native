/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import { directComponent } from '@fluentui-react-native/framework-base';

import { Icon } from './icon';
import type { IconElementProps } from './icon.types';

type StoryGroupProps = {
  children: ReactNode;
  label: string;
};

type StoryItemProps = {
  children: ReactNode;
  label: string;
};

const StoryGroup = ({ children, label }: StoryGroupProps) => (
  <View style={styles.group}>
    <Text style={styles.groupLabel}>{label}</Text>
    <View style={styles.row}>{children}</View>
  </View>
);

const StoryItem = ({ children, label }: StoryItemProps) => (
  <View style={styles.item}>
    {children}
    <Text style={styles.itemLabel}>{label}</Text>
  </View>
);

const imageDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
const starIcon = { codepoint: 0x2605, fontFamily: 'Arial' } as const;
const checkIcon = { codepoint: 0x2713, fontFamily: 'Arial' } as const;

const SampleSvgIcon = directComponent<IconElementProps>(({ color, height, width, ...props }) => {
  const rootStyle: ViewStyle = {
    alignItems: 'center',
    height,
    justifyContent: 'center',
    width,
  };
  const size = Math.min(height ?? 20, width ?? 20) / 2;
  const glyphStyle: ViewStyle = {
    backgroundColor: color,
    borderRadius: size / 2,
    height: size,
    width: size,
  };
  return (
    <View {...props} style={rootStyle}>
      <View style={glyphStyle} />
    </View>
  );
});

const meta: Meta<typeof Icon> = {
  title: 'Primitives/Icon',
  component: Icon,
  args: {
    accessibilityLabel: 'Favorite',
    color: '#185abd',
    height: 24,
    testID: 'agentic-storybook-icon',
    width: 24,
  },
  argTypes: {
    color: { control: 'color' },
    height: { control: { type: 'number', min: 8, max: 64, step: 4 } },
    width: { control: { type: 'number', min: 8, max: 64, step: 4 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Icon is an unstyled primitive that renders exactly one font glyph, image, or SVG component and forwards shared size, color, and accessibility props.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: {
    fontSource: starIcon,
  },
};

export const Overview: Story = {
  render: ({ color, height, width }) => (
    <View style={styles.story}>
      <StoryGroup label="Source">
        <StoryItem label="Font">
          <Icon accessibilityLabel="Favorite" color={color} fontSource={starIcon} height={height} width={width} />
        </StoryItem>
        <StoryItem label="Image">
          <Icon accessibilityLabel="Sample image" color={color} height={height} imageSource={{ uri: imageDataUri }} width={width} />
        </StoryItem>
        <StoryItem label="SVG">
          <Icon accessibilityLabel="Sample circle" color={color} height={height} svgSource={SampleSvgIcon} width={width} />
        </StoryItem>
      </StoryGroup>
      <StoryGroup label="Size">
        {[16, 24, 32].map((size) => (
          <StoryItem key={size} label={`${size} x ${size}`}>
            <Icon accessibilityLabel={`Favorite, ${size} by ${size}`} color={color} fontSource={starIcon} height={size} width={size} />
          </StoryItem>
        ))}
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the three mutually exclusive source types and representative square dimensions.',
      },
    },
  },
};

export const FontCodepoint: Story = {
  args: {
    accessibilityLabel: 'Confirm',
    fontSource: checkIcon,
  },
  parameters: {
    docs: {
      description: {
        story: 'fontSource renders a Unicode codepoint with an optional icon font family.',
      },
    },
  },
};

export const Image: Story = {
  args: {
    accessibilityLabel: 'Sample image',
    imageSource: { uri: imageDataUri },
  },
  parameters: {
    docs: {
      description: {
        story: 'imageSource renders a React Native Image and applies color as its tint color.',
      },
    },
  },
};

export const SvgComponent: Story = {
  args: {
    accessibilityLabel: 'Sample circle',
    svgSource: SampleSvgIcon,
  },
  parameters: {
    docs: {
      description: {
        story: "svgSource receives the primitive's color, height, width, accessibility, and test props.",
      },
    },
  },
};

export const Size: Story = {
  render: ({ color }) => (
    <StoryGroup label="Size">
      {[12, 16, 20, 24, 32, 40].map((size) => (
        <StoryItem key={size} label={`${size}`}>
          <Icon accessibilityLabel={`Favorite, size ${size}`} color={color} fontSource={starIcon} height={size} width={size} />
        </StoryItem>
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'height and width are forwarded to the selected renderer; font glyph size uses the smaller dimension.',
      },
    },
  },
};

export const Color: Story = {
  render: ({ height, width }) => (
    <StoryGroup label="Color">
      {[
        { label: 'Brand', value: '#185abd' },
        { label: 'Neutral', value: '#242424' },
        { label: 'Danger', value: '#d13438' },
        { label: 'Success', value: '#107c10' },
      ].map(({ label, value }) => (
        <StoryItem key={value} label={label}>
          <Icon accessibilityLabel={`${label} favorite`} color={value} fontSource={starIcon} height={height} width={width} />
        </StoryItem>
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'color is forwarded as font color, image tint color, or the SVG component color prop.',
      },
    },
  },
};

export const Accessibility: Story = {
  args: {
    accessibilityHint: 'Marks the item as a favorite',
    accessibilityLabel: 'Favorite',
    fontSource: starIcon,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Standalone informative icons need a descriptive accessibilityLabel. Higher-order controls can mark decorative icon slots inaccessible.',
      },
    },
  },
};

const styles = StyleSheet.create({
  group: {
    alignItems: 'flex-start',
    gap: 8,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  item: {
    alignItems: 'center',
    gap: 4,
    minWidth: 56,
  },
  itemLabel: {
    fontSize: 11,
  },
  row: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});
