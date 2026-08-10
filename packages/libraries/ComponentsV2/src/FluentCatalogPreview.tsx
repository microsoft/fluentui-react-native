import * as React from 'react';
import {
  LinkV1,
  Persona,
  RadioButton,
  RadioGroup,
  Tab,
  TabList,
  TextV1,
} from '@fluentui/react-native';
import { useFluentTheme } from '@fluentui-react-native/framework';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Switch as NativeSwitch,
  Text,
  TextInput,
  View,
} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {Path, Svg} from 'react-native-svg';

import { Button, CompoundButton, MenuButton, SplitButton, ToggleButton } from './Button';
import type { ButtonProps } from './Button';
import { Card, CardFooter, CardHeader, CardPreview as NativeCardPreview } from './Card';
import { Carousel } from './Carousel';
import { Checkbox } from './Checkbox';
import { Combobox, ComboboxOption, ComboboxOptionGroup } from './Combobox';
import { DataGrid } from './DataGrid';
import type { DataGridColumn, DataGridRowId, DataGridSortState } from './DataGrid';
import { Dialog } from './Dialog';
import { Divider } from './Divider';
import { Drawer } from './Drawer';
import { Dropdown, DropdownOption } from './Dropdown';
import { Field } from './Field';
import { Image as FluentImage } from './Image';
import { InfoLabel } from './InfoLabel';
import { Input } from './Input';
import { Label } from './Label';
import { Link } from './Link';
import { List, ListItem } from './List';
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel } from './Accordion';
import { Avatar } from './Avatar';
import type { AvatarSize } from './Avatar';
import { AvatarGroup, AvatarGroupItem } from './AvatarGroup';
import { Badge, resolveBadgeColorTokens } from './Badge';
import type { BadgeAppearance, BadgeColor, BadgeShape, BadgeSize } from './Badge';
import { CounterBadge } from './CounterBadge';
import { PresenceBadge } from './PresenceBadge';
import {
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
  partitionBreadcrumbItems,
} from './Breadcrumb';

export interface FluentCatalogPreviewProps {
  readonly component: string;
  readonly mode: string;
}

const colors = ['#0f6cbd', '#d13438', '#107c10', '#8764b8', '#f7630c', '#038387'];
const webAvatarSizes = [16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 120] as const;
const webAvatarImage = 'https://fabricweb.azureedge.net/fabric-website/assets/images/avatar/KatriAthokas.jpg';
const webAvatarNames = [
  'Johnie McConnell',
  'Allan Munger',
  'Erik Nason',
  'Kristin Patterson',
  'Daisy Phillips',
  'Carole Poland',
  'Carlos Slattery',
  'Robert Tolbert',
  'Kevin Sturgis',
  'Charlotte Waltson',
  'Elliot Woodward',
] as const;
const webAvatarPalette = [
  ['DR', 'darkRed'],
  ['CR', 'cranberry'],
  ['RE', 'red'],
  ['PU', 'pumpkin'],
  ['PE', 'peach'],
  ['MA', 'marigold'],
  ['GO', 'gold'],
  ['BS', 'brass'],
  ['BR', 'brown'],
  ['FO', 'forest'],
  ['SE', 'seafoam'],
  ['DG', 'darkGreen'],
  ['LT', 'lightTeal'],
  ['TE', 'teal'],
  ['ST', 'steel'],
  ['BL', 'blue'],
  ['RB', 'royalBlue'],
  ['CO', 'cornflower'],
  ['NA', 'navy'],
  ['LA', 'lavender'],
  ['PU', 'purple'],
  ['GR', 'grape'],
  ['LI', 'lilac'],
  ['PI', 'pink'],
  ['MA', 'magenta'],
  ['PL', 'plum'],
  ['BE', 'beige'],
  ['MI', 'mink'],
  ['PL', 'platinum'],
  ['AN', 'anchor'],
] as const;

const webAvatarColors: Record<string, string> = {
  anchor: '#394146',
  beige: '#7a7574',
  blue: '#0078d4',
  brass: '#986f0b',
  brown: '#8e562e',
  cornflower: '#4f6bed',
  cranberry: '#c50f1f',
  darkGreen: '#0e700e',
  darkRed: '#750b1c',
  forest: '#498205',
  gold: '#c19c00',
  grape: '#881798',
  lavender: '#7160e8',
  lightTeal: '#00b7c3',
  lilac: '#b146c2',
  magenta: '#bf0077',
  marigold: '#eaa300',
  mink: '#5d4447',
  navy: '#0027b4',
  peach: '#ff8c00',
  pink: '#e43ba6',
  platinum: '#69797e',
  plum: '#77004d',
  pumpkin: '#ca5010',
  purple: '#5c2e91',
  red: '#d13438',
  royalBlue: '#004e8c',
  seafoam: '#00cc6a',
  steel: '#005b70',
  teal: '#008272',
};

function avatarIcon(codepoint: number) {
  return codepoint;
}

const personIcon = avatarIcon(0xe77b);
const peopleIcon = avatarIcon(0xe716);
const teamIcon = avatarIcon(0xf2bb);
const phoneIcon = avatarIcon(0xe717);
const calendarIcon = avatarIcon(0xe787);
const briefcaseIcon = avatarIcon(0xe821);
const roomIcon = avatarIcon(0xe7ef);
const clipboardPastePath =
  'M4.5 4h1.585A1.5 1.5 0 0 0 7.5 5h3a1.5 1.5 0 0 0 1.415-1H13.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 0 1 0v-1A1.5 1.5 0 0 0 13.5 3h-1.585A1.5 1.5 0 0 0 10.5 2h-3a1.5 1.5 0 0 0-1.415 1H4.5A1.5 1.5 0 0 0 3 4.5v12A1.5 1.5 0 0 0 4.5 18h3a.5.5 0 0 0 0-1h-3a.5.5 0 0 1-.5-.5v-12a.5.5 0 0 1 .5-.5Zm3 0a.5.5 0 0 1 0-1h3a.5.5 0 0 1 0 1h-3Zm3 3A1.5 1.5 0 0 0 9 8.5v8a1.5 1.5 0 0 0 1.5 1.5h5a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 15.5 7h-5Zm-.5 1.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-8Z';

const buttonCalendarIcon = {
  fontSource: {
    codepoint: 0xe787,
    fontFamily: 'Segoe Fluent Icons',
    fontSize: 16,
  },
};
const buttonChevronDownIcon = <Text accessible={false} style={{fontFamily: 'Segoe Fluent Icons', fontSize: 12}}>{'\ue70d'}</Text>;
const buttonFilterIcon = <Text accessible={false} style={{fontFamily: 'Segoe Fluent Icons', fontSize: 12}}>{'\ue71c'}</Text>;

function includes(value: string, ...terms: string[]) {
  const normalized = value.toLocaleLowerCase();
  return terms.some(term => normalized.includes(term));
}

function Surface({children}: React.PropsWithChildren): React.ReactElement {
  return <View style={styles.surface}>{children}</View>;
}

function Pill({children, selected}: React.PropsWithChildren<{readonly selected?: boolean}>): React.ReactElement {
  return (
    <View style={[styles.pill, selected && styles.pillSelected]}>
      <Text style={[styles.body, selected && styles.pillTextSelected]}>{children}</Text>
    </View>
  );
}

interface AccordionPreviewItem {
  readonly expandIconPosition?: 'start' | 'end';
  readonly headingLevel?: 1 | 2 | 3 | 4;
  readonly label: string;
  readonly size: 'small' | 'medium' | 'large' | 'extra-large';
  readonly value: number;
}

function AccordionRocketIcon(): React.ReactElement {
  return (
    <Svg height={20} viewBox="0 0 20 20" width={20}>
      <Path
        d="M10.755 6.426a2 2 0 1 1 2.827 2.827 2 2 0 0 1-2.827-2.827Zm2.119.708a1 1 0 1 0-1.412 1.411 1 1 0 0 0 1.412-1.411Zm-1.125 7.37a1.5 1.5 0 0 1-1.704-.295l-.609-.609-.732 1.22a.5.5 0 0 1-.782.097l-2.83-2.831a.5.5 0 0 1 .096-.782l1.23-.732-.61-.61a1.5 1.5 0 0 1-.295-1.703L4.384 7.139a.5.5 0 0 1 0-.707l1.06-1.06a3 3 0 0 1 3.412-.589l.938-.937a6.34 6.34 0 0 1 6.33-1.557 2.5 2.5 0 0 1 1.594 1.595 6.34 6.34 0 0 1-1.556 6.33l-.937.938a3 3 0 0 1-.59 3.412l-1.06 1.06a.5.5 0 0 1-.706 0l-1.12-1.12Zm4.076-11.26a5.34 5.34 0 0 0-5.324 1.309L6.856 8.197a.5.5 0 0 0-.351 1.058l4.247 4.247a.5.5 0 0 0 1.055.048l3.648-4.043a5.34 5.34 0 0 0 1.309-5.325 1.5 1.5 0 0 0-.939-.938ZM8.707 12.87l-1.57-1.57-.886.532 1.925 1.925.531-.886Zm-2.904 2.041a.5.5 0 0 0-.707-.707l-1.768 1.768a.5.5 0 0 0 .707.707l1.768-1.768Zm-1.415-2.122a.5.5 0 0 1 0 .707l-.71.71a.5.5 0 0 1-.706-.708l.709-.709a.5.5 0 0 1 .707 0Zm2.83 3.538a.5.5 0 0 0-.707-.707l-.709.709a.5.5 0 0 0 .707.707l.709-.709Z"
        fill="#242424"
      />
    </Svg>
  );
}

function AccordionPreview({mode}: {readonly mode: string}): React.ReactElement {
  const multiple = includes(mode, 'multiple');
  const controlled = includes(mode, 'controlled');
  const initiallyOpen = includes(mode, 'open items') ? [0] : controlled ? [0] : multiple ? [0, 1] : [];
  const [openItems, setOpenItems] = React.useState<(string | number)[]>(initiallyOpen);
  const disabled = includes(mode, 'disabled');
  const iconAfter = includes(mode, 'position');
  const inline = includes(mode, 'inline');
  const customIcon = includes(mode, 'expand icon');
  const controlsOpenState = controlled || customIcon;
  const withIcon = includes(mode, 'with icon');
  const motion = includes(mode, 'motion custom');
  const sizes = includes(mode, 'sizes');
  const headingLevels = includes(mode, 'heading levels');
  const [duration, setDuration] = React.useState(1000);
  const [animateOpacity, setAnimateOpacity] = React.useState(true);
  const [sliderWidth, setSliderWidth] = React.useState(0);
  const items: AccordionPreviewItem[] = sizes
    ? [
        {label: 'Small Header', size: 'small' as const, value: 0},
        {label: 'Medium Header', size: 'medium' as const, value: 1},
        {label: 'Large Header', size: 'large' as const, value: 2},
        {label: 'Extra-Large Header', size: 'extra-large' as const, value: 3},
      ]
    : headingLevels
      ? [
          {headingLevel: 1 as const, label: 'Accordion Header as h1', size: 'medium' as const, value: 0},
          {headingLevel: 2 as const, label: 'Accordion Header as h2', size: 'medium' as const, value: 1},
          {headingLevel: 3 as const, label: 'Accordion Header as h3', size: 'medium' as const, value: 2},
          {headingLevel: 4 as const, label: 'Accordion Header as h4', size: 'medium' as const, value: 3},
        ]
      : iconAfter
        ? [
            {expandIconPosition: 'end' as const, label: 'Accordion Header 1', size: 'medium' as const, value: 0},
            {expandIconPosition: 'start' as const, label: 'Accordion Header 2', size: 'medium' as const, value: 1},
          ]
        : [1, 2, 3].map((item, index) => ({
            label: motion ? `Team ${String.fromCharCode(65 + index)}` : `Accordion Header ${item}`,
            size: 'medium' as const,
            value: index,
          }));
  const groups = sizes ? items.map(item => [item]) : [items];
  const sliderPercent = Math.max(0, Math.min(1, (duration - 100) / 1900));
  const motionPersonas = [
    {initials: 'KS', name: 'Kevin Sturgis', presence: 'online' as const, secondaryText: 'Available'},
    {initials: 'SC', name: 'Sarah Chen', presence: 'busy' as const, secondaryText: 'In a meeting'},
    {initials: 'JB', name: 'Jessica Brown', presence: 'dnd' as const, secondaryText: 'Do not disturb'},
    {initials: 'EJ', name: 'Emily Johnson', presence: 'online' as const, secondaryText: 'Available'},
    {initials: 'DK', name: 'David Kim', presence: 'offline' as const, secondaryText: 'Offline'},
    {initials: 'MR', name: 'Michael Rodriguez', presence: 'away' as const, secondaryText: 'Away'},
  ];
  const motionGroups = [
    motionPersonas.slice(0, 3),
    motionPersonas.slice(3),
    motionPersonas,
  ];

  return (
    <View style={styles.column}>
      {motion ? (
        <View style={styles.accordionMotionControls}>
          <Text style={styles.body}>Duration: {duration}ms</Text>
          <Pressable
            accessibilityActions={[{name: 'increment'}, {name: 'decrement'}]}
            accessibilityLabel={`Duration: ${duration}ms`}
            accessibilityRole="adjustable"
            accessibilityValue={{max: 2000, min: 100, now: duration, text: `${duration}ms`}}
            onAccessibilityAction={event => {
              if (event.nativeEvent.actionName === 'increment') {
                setDuration(value => Math.min(2000, value + 50));
              } else if (event.nativeEvent.actionName === 'decrement') {
                setDuration(value => Math.max(100, value - 50));
              }
            }}
            onLayout={event => setSliderWidth(event.nativeEvent.layout.width)}
            onPress={event => {
              if (sliderWidth > 0) {
                const nextValue = 100 + (event.nativeEvent.locationX / sliderWidth) * 1900;
                setDuration(Math.max(100, Math.min(2000, Math.round(nextValue / 50) * 50)));
              }
            }}
            style={styles.accordionSlider}
          >
            <View style={[styles.accordionSliderFill, {width: `${sliderPercent * 100}%`}]} />
            <View style={[styles.accordionSliderThumb, {left: `${sliderPercent * 100}%`}]} />
          </Pressable>
          <View style={[styles.switchPreview, styles.accordionMotionSwitch]}>
            <NativeSwitch
              onValueChange={setAnimateOpacity}
              thumbColor="#ffffff"
              trackColor={{false: '#b3b0ad', true: '#0f6cbd'}}
              value={animateOpacity}
            />
            <Text style={[styles.body, styles.accordionMotionSwitchLabel]}>Animate opacity</Text>
          </View>
        </View>
      ) : null}
      {groups.map((group, groupIndex) => (
        <Accordion
          collapsible={motion || includes(mode, 'collapsible')}
          defaultOpenItems={controlsOpenState ? undefined : initiallyOpen}
          key={groupIndex}
          multiple={multiple}
          onToggle={(_, data) => {
            if (controlsOpenState) {
              setOpenItems(data.openItems);
            }
          }}
          openItems={controlsOpenState ? openItems : undefined}
        >
          {group.map(item => (
            <AccordionItem disabled={disabled && item.value === 2} key={item.value} value={item.value}>
              <AccordionHeader
                expandIcon={customIcon ? <Text style={styles.chevron}>{openItems.includes(item.value) ? '-' : '+'}</Text> : undefined}
                expandIconPosition={item.expandIconPosition ?? 'start'}
                headingLevel={item.headingLevel ?? 2}
                icon={withIcon ? <AccordionRocketIcon /> : undefined}
                inline={inline}
                size={item.size}
              >
                {item.label}
              </AccordionHeader>
              <AccordionPanel collapseMotion={motion ? {animateOpacity, duration} : undefined}>
                {motion ? (
                  <View style={styles.accordionPersonaList}>
                    {motionGroups[item.value].map(persona => (
                      <Persona
                        initials={persona.initials}
                        key={persona.name}
                        presence={persona.presence}
                        secondaryText={persona.secondaryText}
                        size="size40"
                        text={persona.name}
                      />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.body}>Accordion Panel {item.value + 1}</Text>
                )}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      ))}
    </View>
  );
}

function AvatarGlyph({codepoint, color = '#ffffff'}: {readonly codepoint: number; readonly color?: string}): React.ReactElement {
  return <Text style={[styles.avatarGlyph, {color}]}>{String.fromCharCode(codepoint)}</Text>;
}

function AvatarGroupRow({
  indicator,
  layout = 'spread',
  size = 32,
  tooltip = '7 more people',
}: {
  readonly indicator?: 'count' | 'icon';
  readonly layout?: 'pie' | 'spread' | 'stack';
  readonly size?: AvatarSize;
  readonly tooltip?: string;
}): React.ReactElement {
  return (
    <AvatarGroup
      layout={layout}
      maxItems={layout === 'pie' ? 3 : 5}
      overflowIndicatorAppearance={indicator}
      overflowTooltip={tooltip}
      size={size}
    >
      {webAvatarNames.map(name => (
        <AvatarGroupItem color="colorful" key={name} name={name} tooltip={name} />
      ))}
    </AvatarGroup>
  );
}

function AvatarGroupPreview({mode}: {readonly mode: string}): React.ReactElement {
  if (includes(mode, 'layout')) {
    return (
      <View style={styles.avatarGroupColumn}>
        <AvatarGroupRow layout="spread" />
        <AvatarGroupRow layout="stack" />
        <AvatarGroupRow layout="pie" />
      </View>
    );
  }

  if (includes(mode, 'indicator')) {
    return (
      <View style={styles.avatarGroupColumn}>
        <AvatarGroupRow indicator="count" />
        <AvatarGroupRow indicator="icon" />
      </View>
    );
  }

  if (includes(mode, 'size')) {
    const layout = includes(mode, 'stack') ? 'stack' : includes(mode, 'pie') ? 'pie' : 'spread';
    return (
      <View style={styles.avatarGroupColumn}>
        {webAvatarSizes.map(size => <AvatarGroupRow key={size} layout={layout} size={size} />)}
        <AvatarGroupRow layout={layout} size={128} />
      </View>
    );
  }

  if (includes(mode, 'tooltip')) {
    return <AvatarGroupRow tooltip="My custom tooltip" />;
  }

  return <AvatarGroupRow />;
}

function AvatarPreview({component, mode}: FluentCatalogPreviewProps): React.ReactElement {
  if (component.includes('Avatar Group')) {
    return <AvatarGroupPreview mode={mode} />;
  }

  if (includes(mode, 'default')) {
    return <Avatar accessibilityLabel="Guest" size={32} />;
  }

  if (includes(mode, 'name')) {
    return <Avatar name="Ashley McCarthy" size={32} />;
  }

  if (includes(mode, 'image')) {
    return <Avatar imageUrl={webAvatarImage} name="Katri Athokas" size={32} />;
  }

  if (includes(mode, 'badge icon')) {
    return (
      <Avatar
        badge={<Badge icon={<AvatarGlyph codepoint={calendarIcon} />} size="tiny" />}
        name="John Doe"
        size={32}
      />
    );
  }

  if (includes(mode, 'icon')) {
    const icons = [
      ['Guest', personIcon, 'circular'],
      ['Group', peopleIcon, 'circular'],
      ['Team', teamIcon, 'square'],
      ['Phone Contact', phoneIcon, 'circular'],
      ['Meeting', calendarIcon, 'circular'],
      ['Tenant', briefcaseIcon, 'square'],
      ['Room', roomIcon, 'square'],
    ] as const;

    return (
      <View style={styles.avatarStoryRow}>
        {icons.map(([label, icon, shape]) => (
          <Avatar accessibilityLabel={label} icon={<AvatarGlyph codepoint={icon} />} key={label} shape={shape} size={32} />
        ))}
      </View>
    );
  }

  if (includes(mode, 'badge')) {
    const badgeAvatars = [
      ['Lydia Bauer', 'available', false],
      ['Amanda Brady', 'busy', false],
      ['Henry Brill', 'outOfOffice', false],
      ['Robin Counts', 'away', false],
      ['Tim Deboer', 'offline', false],
      ['Cameron Evans', 'doNotDisturb', false],
      ['Wanda Howard', 'blocked', false],
      ['Mona Kane', 'available', true],
      ['Allan Munger', 'busy', true],
      ['Erik Nason', 'outOfOffice', true],
      ['Daisy Phillips', 'away', true],
      ['Kevin Sturgis', 'offline', true],
      ['Elliot Woodward', 'doNotDisturb', true],
      ['Wanda Howard', 'blocked', true],
    ] as const;

    return (
      <View style={styles.avatarStoryRow}>
        {badgeAvatars.map(([name, status, outOfOffice], index) => (
          <Avatar
            badge={
              <PresenceBadge
                outOfOffice={outOfOffice}
                status={status === 'doNotDisturb' ? 'do-not-disturb' : status === 'outOfOffice' ? 'out-of-office' : status}
              />
            }
            key={`${name}-${index}`}
            name={name}
            size={32}
          />
        ))}
      </View>
    );
  }

  if (includes(mode, 'square')) {
    return <Avatar accessibilityLabel="square avatar" icon={<AvatarGlyph codepoint={teamIcon} />} shape="square" size={32} />;
  }

  if (includes(mode, 'color brand')) {
    return <Avatar color="brand" initials="BR" name="brand color avatar" size={32} />;
  }

  if (includes(mode, 'color colorful')) {
    const names = [
      'Katri Athokas',
      'Elvia Atkins',
      'Cameron Evans',
      'Wanda Howard',
      'Mona Kane',
      'Allan Munger',
      'Daisy Phillips',
      'Robert Tolbert',
      'Kevin Sturgis',
      'Elliot Woodward',
    ] as const;

    return (
      <View style={styles.avatarStoryRow}>
        {names.map(name => <Avatar color="colorful" key={name} name={name} size={32} />)}
        {['id-123', '42', '93', 'Guest-23'].map(id => (
          <Avatar accessibilityLabel="Guest" color="colorful" icon={<AvatarGlyph codepoint={personIcon} />} idForColor={id} key={id} size={32} />
        ))}
      </View>
    );
  }

  if (includes(mode, 'color palette')) {
    return (
      <View style={styles.avatarStoryRow}>
        {webAvatarPalette.map(([initials, avatarColor]) => (
          <Avatar color={avatarColor} initials={initials} key={avatarColor} name={`${avatarColor} avatar`} size={32} />
        ))}
      </View>
    );
  }

  if (includes(mode, 'active appearance')) {
    return (
      <View style={styles.avatarStoryRow}>
        <Avatar active="active" activeAppearance="ring" name="Ring" size={32} />
        <Avatar active="active" activeAppearance="shadow" name="Shadow" size={32} />
        <Avatar active="active" activeAppearance="ring-shadow" name="Ring Shadow" size={32} />
      </View>
    );
  }

  if (includes(mode, 'active')) {
    return (
      <View style={styles.avatarActiveRow}>
        <Avatar active="active" name="Ashley McCarthy" size={32} />
        <Avatar active="inactive" badge={<PresenceBadge status="away" />} name="Isaac Fielder" size={32} />
      </View>
    );
  }

  if (includes(mode, 'initials')) {
    return <Avatar initials="CRF" name="Cecil Robin Folk" size={32} />;
  }

  if (includes(mode, 'size')) {
    return (
      <View style={styles.avatarStoryRow}>
        {webAvatarSizes.map(size => <Avatar initials={String(size)} key={size} size={size} />)}
        <Avatar initials="128" size={128} />
      </View>
    );
  }

  return <Avatar size={32} />;
}

function BadgeStoryItem({
  appearance = 'filled',
  children,
  color = 'brand',
  icon = false,
  shape = 'circular',
  size = 'medium',
}: {
  readonly appearance?: BadgeAppearance;
  readonly children?: React.ReactNode;
  readonly color?: BadgeColor;
  readonly icon?: boolean;
  readonly shape?: BadgeShape;
  readonly size?: BadgeSize;
}): React.ReactElement {
  const theme = useFluentTheme();
  const badgeColors = resolveBadgeColorTokens(theme, appearance, color);
  return (
    <Badge
      appearance={appearance}
      color={color}
      icon={icon ? (
        <Svg height="100%" viewBox="0 0 20 20" width="100%">
          <Path d={clipboardPastePath} fill={badgeColors.foregroundColor} />
        </Svg>
      ) : undefined}
      shape={shape}
      size={size}
    >
      {children}
    </Badge>
  );
}

function BadgePreview({component, mode}: FluentCatalogPreviewProps): React.ReactElement {
  if (component.includes('Presence')) {
    const statuses = includes(mode, 'status', 'out of office')
      ? (['available', 'away', 'busy', 'do-not-disturb', 'offline', 'out-of-office', 'blocked', 'unknown'] as const)
      : (['available'] as const);
    const sizes = includes(mode, 'sizes')
      ? (['tiny', 'extra-small', 'small', 'medium', 'large', 'extra-large'] as const)
      : (['medium'] as const);
    return (
      <View style={styles.row}>
        {sizes.flatMap(size =>
          statuses.map(status => (
            <PresenceBadge
              key={`${size}-${status}`}
              outOfOffice={includes(mode, 'out of office')}
              size={size}
              status={status}
            />
          )),
        )}
      </View>
    );
  }

  const counter = component.includes('Counter');
  if (counter) {
    if (includes(mode, 'dot')) {
      return <CounterBadge accessibilityLabel="New activity" dot />;
    }
    const appearances = includes(mode, 'appearance') ? (['filled', 'ghost'] as const) : (['filled'] as const);
    const shapes = includes(mode, 'shapes') ? (['circular', 'rounded'] as const) : (['circular'] as const);
    const sizes = includes(mode, 'sizes')
      ? (['tiny', 'extra-small', 'small', 'medium', 'large', 'extra-large'] as const)
      : (['medium'] as const);
    const badgeColors = includes(mode, 'color')
      ? (['brand', 'danger', 'important', 'informative'] as const)
      : (['brand'] as const);
    return (
      <View style={styles.row}>
        {appearances.flatMap(appearance =>
          shapes.flatMap(shape =>
            sizes.flatMap(size =>
              badgeColors.map(color => (
                <CounterBadge
                  accessibilityLabel="5 notifications"
                  appearance={appearance}
                  color={color}
                  count={5}
                  key={`${appearance}-${shape}-${size}-${color}`}
                  shape={shape}
                  size={size}
                />
              )),
            ),
          ),
        )}
      </View>
    );
  }

  const badgeColors = ['brand', 'danger', 'important', 'informative', 'severe', 'subtle', 'success', 'warning'] as const;
  if (includes(mode, 'color and appearance')) {
    const appearances = ['filled', 'ghost', 'outline', 'tint'] as const;
    return (
      <View style={styles.badgeAppearanceColumn}>
        {appearances.map(appearance => (
          <View key={appearance} style={styles.badgeAppearanceSection}>
            <Text style={styles.badgeAppearanceHeading}>
              {appearance.slice(0, 1).toLocaleUpperCase() + appearance.slice(1)}
            </Text>
            <View style={styles.row}>
              {badgeColors.map(color => {
                const badge = (
                  <BadgeStoryItem appearance={appearance} color={color} icon>
                    999+
                  </BadgeStoryItem>
                );
                return color === 'subtle' && (appearance === 'ghost' || appearance === 'outline') ? (
                  <View key={`${appearance}-${color}`} style={styles.badgeBrandBackground}>
                    {badge}
                  </View>
                ) : (
                  <React.Fragment key={`${appearance}-${color}`}>{badge}</React.Fragment>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    );
  }
  if (includes(mode, 'appearance')) {
    return (
      <View style={styles.row}>
        {(['filled', 'ghost', 'outline', 'tint'] as const).map(appearance => (
          <BadgeStoryItem appearance={appearance} key={appearance}>999+</BadgeStoryItem>
        ))}
      </View>
    );
  }
  if (includes(mode, 'sizes')) {
    return (
      <View style={styles.row}>
        {(['tiny', 'extra-small', 'small', 'medium', 'large', 'extra-large'] as const).map(size => (
          <BadgeStoryItem key={size} size={size} />
        ))}
      </View>
    );
  }
  if (includes(mode, 'shapes')) {
    return (
      <View style={styles.row}>
        {(['square', 'rounded', 'circular'] as const).map(shape => <BadgeStoryItem key={shape} shape={shape} />)}
      </View>
    );
  }
  if (includes(mode, 'color')) {
    return (
      <View style={styles.row}>
        {badgeColors.map(color => <BadgeStoryItem color={color} key={color}>999+</BadgeStoryItem>)}
      </View>
    );
  }
  if (includes(mode, 'icon')) {
    return <BadgeStoryItem icon />;
  }
  return <BadgeStoryItem />;
}

function ButtonPreview({component, mode}: FluentCatalogPreviewProps): React.ReactElement {
  const disabled = includes(mode, 'disabled');
  const compound = component.includes('Compound');
  const toggle = component.includes('Toggle');
  const split = component.includes('Split');
  const menu = component.includes('Menu');
  const initiallySelected = includes(mode, 'checked', 'selected');
  const [selectedByLabel, setSelectedByLabel] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState(false);
  const [openMenuLabel, setOpenMenuLabel] = React.useState<string>();

  interface PreviewButtonOptions {
    readonly accessibilityLabel?: string;
    readonly appearance?: ButtonProps['appearance'];
    readonly disabled?: boolean;
    readonly disabledFocusable?: boolean;
    readonly icon?: ButtonProps['icon'];
    readonly iconOnly?: boolean;
    readonly iconPosition?: ButtonProps['iconPosition'];
    readonly interactive?: boolean;
    readonly label: string;
    readonly menuIcon?: React.ReactNode;
    readonly primaryActionStyle?: ButtonProps['style'];
    readonly selected?: boolean;
    readonly shape?: ButtonProps['shape'];
    readonly size?: ButtonProps['size'];
    readonly style?: StyleProp<ViewStyle>;
  }

  const wrapMenu = (content: React.ReactElement, label: string): React.ReactElement => (
    <View style={styles.buttonMenuContainer}>
      {content}
      {openMenuLabel === label ? (
        <View style={styles.buttonMenuPopup}>
          {['Item a', 'Item b'].map(item => (
            <Button
              appearance="subtle"
              key={item}
              onAccessibilityAction={() => setOpenMenuLabel(undefined)}
              onClick={() => setOpenMenuLabel(undefined)}
              size="small"
              style={styles.buttonMenuItem}
            >
              {item}
            </Button>
          ))}
        </View>
      ) : null}
    </View>
  );

  const renderButton = ({
    accessibilityLabel,
    appearance = 'secondary',
    disabled: buttonDisabled = false,
    disabledFocusable = false,
    icon,
    iconOnly = false,
    iconPosition,
    interactive,
    label,
    menuIcon,
    primaryActionStyle,
    selected: selectedOverride,
    shape,
    size,
    style,
  }: PreviewButtonOptions): React.ReactElement => {
    const isSelected = selectedByLabel[label] ?? selectedOverride ?? initiallySelected;
    const shouldInteract = interactive ?? (menu || split || toggle);
    const shouldActivate = shouldInteract && !buttonDisabled && !disabledFocusable;
    const isMenuOpen = openMenuLabel === label;

    if (split) {
      return wrapMenu(
        <SplitButton
          accessibilityLabel={accessibilityLabel}
          appearance={appearance}
          disabled={buttonDisabled}
          disabledFocusable={disabledFocusable}
          expanded={isMenuOpen}
          icon={icon}
          menuButton={{accessibilityLabel: 'More actions'}}
          menuIcon={menuIcon ?? buttonChevronDownIcon}
          onClick={shouldActivate ? () => undefined : undefined}
          onMenuClick={
            shouldActivate
              ? () => setOpenMenuLabel(current => current === label ? undefined : label)
              : undefined
          }
          primaryActionButton={
            iconOnly || primaryActionStyle
              ? {accessibilityLabel, iconOnly: iconOnly || undefined, style: primaryActionStyle}
              : undefined
          }
          shape={shape}
          size={size}
          style={style}
        >
          {label}
        </SplitButton>,
        label,
      );
    }

    if (toggle) {
      return (
        <ToggleButton
          accessibilityLabel={accessibilityLabel}
          appearance={appearance}
          checked={isSelected}
          disabled={buttonDisabled}
          disabledFocusable={disabledFocusable}
          icon={icon}
          iconOnly={iconOnly}
          iconPosition={iconPosition}
          isAccessible={includes(mode, 'accessible appearance')}
          onCheckedChange={
            shouldActivate
              ? (_, data) => setSelectedByLabel(current => ({...current, [label]: data.checked}))
              : undefined
          }
          shape={shape}
          size={size}
          style={style}
        >
          {iconOnly ? undefined : label}
        </ToggleButton>
      );
    }

    if (menu) {
      return wrapMenu(
        <MenuButton
          accessibilityLabel={accessibilityLabel}
          appearance={appearance}
          disabled={buttonDisabled}
          disabledFocusable={disabledFocusable}
          expanded={isMenuOpen}
          icon={icon}
          iconOnly={iconOnly}
          menuIcon={menuIcon ?? buttonChevronDownIcon}
          onClick={
            shouldActivate
              ? () => setOpenMenuLabel(current => current === label ? undefined : label)
              : undefined
          }
          shape={shape}
          size={size}
          style={style}
        >
          {iconOnly ? undefined : label}
        </MenuButton>,
        label,
      );
    }

    if (compound) {
      return (
        <CompoundButton
          accessibilityLabel={accessibilityLabel}
          appearance={appearance}
          disabled={buttonDisabled}
          disabledFocusable={disabledFocusable}
          icon={icon}
          iconOnly={iconOnly}
          iconPosition={iconPosition}
          secondaryContent="Secondary content"
          shape={shape}
          size={size}
          style={style}
        >
          {iconOnly ? undefined : label}
        </CompoundButton>
      );
    }

    return (
      <Button
        accessibilityLabel={accessibilityLabel}
        appearance={appearance}
        disabled={buttonDisabled}
        disabledFocusable={disabledFocusable}
        icon={icon}
        iconOnly={iconOnly}
        iconPosition={iconPosition}
        shape={shape}
        size={size}
        style={style}
      >
        {iconOnly ? undefined : label}
      </Button>
    );
  };

  if (toggle && includes(mode, 'accessible appearance')) {
    return (
      <View style={styles.row}>
        {renderButton({label: 'Default', selected: false})}
        {renderButton({appearance: 'primary', label: 'Primary', selected: false})}
        {renderButton({appearance: 'outline', label: 'Outline', selected: false})}
        {renderButton({appearance: 'subtle', label: 'Subtle', selected: false})}
        {renderButton({appearance: 'transparent', label: 'Transparent', selected: false})}
      </View>
    );
  }

  if (includes(mode, 'appearance')) {
    const appearanceIcon = split ? undefined : buttonCalendarIcon;
    return (
      <View style={[styles.row, styles.compactButtonRow]}>
        {renderButton({icon: appearanceIcon, label: 'Default', style: split ? undefined : compound ? styles.compactCompoundAppearance : styles.compactAppearanceButton})}
        {renderButton({appearance: 'primary', icon: appearanceIcon, label: 'Primary', style: split ? undefined : compound ? styles.compactCompoundAppearance : styles.compactAppearanceButton})}
        {renderButton({appearance: 'outline', icon: appearanceIcon, label: 'Outline', style: split ? undefined : compound ? styles.compactCompoundAppearance : styles.compactAppearanceButton})}
        {renderButton({appearance: 'subtle', icon: appearanceIcon, label: 'Subtle', style: split ? undefined : compound ? styles.compactCompoundAppearance : styles.compactAppearanceButton})}
        {renderButton({appearance: 'transparent', icon: appearanceIcon, label: 'Transparent', style: split ? undefined : compound ? styles.compactCompoundAppearance : styles.compactAppearanceButton})}
      </View>
    );
  }

  if (includes(mode, 'size')) {
    const singleSize = includes(mode, 'small')
      ? 'small'
      : includes(mode, 'medium')
        ? 'medium'
        : includes(mode, 'large')
          ? 'large'
          : undefined;

    if (singleSize) {
      const sizeLabel = `${singleSize[0].toLocaleUpperCase()}${singleSize.slice(1)}`;
      return (
        <View style={styles.row}>
          {renderButton({label: sizeLabel, size: singleSize})}
          {renderButton({icon: buttonCalendarIcon, label: `${sizeLabel} with calendar icon`, size: singleSize})}
          {renderButton({
            accessibilityLabel: `${sizeLabel} with calendar icon only`,
            icon: buttonCalendarIcon,
            iconOnly: true,
            label: sizeLabel,
            size: singleSize,
          })}
        </View>
      );
    }

    if (!compound && !menu && !split && !toggle) {
      return (
        <View style={styles.row}>
          {(['small', 'medium', 'large'] as const).map(buttonSize => {
            const sizeLabel = `${buttonSize[0].toLocaleUpperCase()}${buttonSize.slice(1)}`;
            return (
              <React.Fragment key={buttonSize}>
                {renderButton({label: sizeLabel, size: buttonSize})}
                {renderButton({icon: buttonCalendarIcon, label: `${sizeLabel} with calendar icon`, size: buttonSize})}
                {renderButton({
                  accessibilityLabel: `${sizeLabel} with calendar icon only`,
                  icon: buttonCalendarIcon,
                  iconOnly: true,
                  label: sizeLabel,
                  size: buttonSize,
                })}
              </React.Fragment>
            );
          })}
        </View>
      );
    }

    return (
      <View style={styles.row}>
        {renderButton({icon: compound ? buttonCalendarIcon : undefined, label: 'Size: small', size: 'small'})}
        {renderButton({icon: compound ? buttonCalendarIcon : undefined, label: 'Size: medium', size: 'medium'})}
        {renderButton({icon: compound ? buttonCalendarIcon : undefined, label: 'Size: large', size: 'large'})}
      </View>
    );
  }

  if (includes(mode, 'shape')) {
    return (
      <View style={styles.row}>
        {renderButton({label: 'Rounded', shape: 'rounded'})}
        {renderButton({label: 'Circular', shape: 'circular'})}
        {renderButton({label: 'Square', shape: 'square'})}
      </View>
    );
  }

  if (includes(mode, 'icon')) {
    if (split) {
      return (
        <View style={styles.row}>
          {renderButton({
            icon: buttonCalendarIcon,
            label: 'With calendar icon before contents',
            primaryActionStyle: styles.splitIconPrimary,
          })}
          {renderButton({
            icon: buttonCalendarIcon,
            iconPosition: 'after',
            label: 'With calendar icon after contents',
            primaryActionStyle: styles.splitIconPrimary,
          })}
          {renderButton({
            icon: buttonCalendarIcon,
            label: 'With calendar icon and custom filter menu icon',
            menuIcon: buttonFilterIcon,
            primaryActionStyle: styles.splitIconPrimary,
          })}
          {renderButton({
            accessibilityLabel: 'With calendar icon only',
            icon: buttonCalendarIcon,
            iconOnly: true,
            label: 'Calendar',
          })}
        </View>
      );
    }

    return (
      <View style={styles.row}>
        {renderButton({icon: buttonCalendarIcon, label: menu ? 'With calendar icon' : 'With calendar icon before contents'})}
        {renderButton({
          icon: buttonCalendarIcon,
          iconPosition: 'after',
          label: menu ? 'With calendar icon and custom filter menu icon' : 'With calendar icon after contents',
          menuIcon: menu ? buttonFilterIcon : undefined,
        })}
        {renderButton({
          accessibilityLabel: menu ? 'With calendar icon and no contents' : 'With calendar icon only',
          icon: buttonCalendarIcon,
          iconOnly: true,
          label: 'Calendar',
        })}
      </View>
    );
  }

  if (includes(mode, 'loading')) {
    return (
      <View style={styles.row}>
        <Button loading={loading} onClick={() => setLoading(true)}>Start loading</Button>
        <Button onClick={() => setLoading(false)}>Reset loading state</Button>
      </View>
    );
  }

  if (includes(mode, 'long text')) {
    return (
      <View style={styles.row}>
        {renderButton({label: 'Short text'})}
        {renderButton({
          label: 'Long text wraps after it hits the max width of the component',
          style: styles.longTextButton,
        })}
      </View>
    );
  }

  if (toggle && includes(mode, 'checked')) {
    return (
      <View style={styles.row}>
        {renderButton({interactive: false, label: 'Controlled checked state', selected: true})}
        {renderButton({interactive: false, label: 'Controlled unchecked state', selected: false})}
      </View>
    );
  }

  if (disabled) {
    const disabledRow = (
      <View style={styles.row}>
        {renderButton({label: 'Enabled state'})}
        {renderButton({disabled: true, label: 'Disabled state'})}
        {renderButton({disabledFocusable: true, label: 'Disabled focusable state'})}
      </View>
    );

    if (menu || split) {
      return disabledRow;
    }

    return (
      <View style={styles.column}>
        {disabledRow}
        <View style={styles.row}>
          {renderButton({appearance: 'primary', label: 'Enabled state'})}
          {renderButton({appearance: 'primary', disabled: true, label: 'Disabled state'})}
          {renderButton({appearance: 'primary', disabledFocusable: true, label: 'Disabled focusable state'})}
        </View>
      </View>
    );
  }

  const defaultLabel = 'Example';

  return renderButton({icon: compound ? buttonCalendarIcon : undefined, label: defaultLabel});
}

function CardPreview({component, mode}: FluentCatalogPreviewProps): React.ReactElement {
  const [selectedCards, setSelectedCards] = React.useState<Record<string, boolean>>({});
  const asset = (name: string) =>
    `https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-card/stories/src/assets/${name}`;
  const assetImage = (name: string, size: number, style?: StyleProp<ViewStyle>) =>
    <View style={[{height: size, width: size}, style]}>
      {name === 'avatar_elvia.svg' ? (
        <Image source={{uri: webAvatarImage}} style={styles.cardImage} />
      ) : name === 'app_logo.svg' ? (
        <View style={styles.cardAppMark}>
          <Text style={styles.cardAppMarkText}>AR</Text>
        </View>
      ) : name === 'logo.svg' ? (
        <View style={[styles.cardAutomationLogo, styles.cardAutomationLogoBlue]}>
          <Text style={styles.cardAutomationLogoText}>➤</Text>
        </View>
      ) : name === 'logo2.svg' ? (
        <View style={[styles.cardAutomationLogo, styles.cardAutomationLogoGreen]}>
          <Text style={styles.cardAutomationLogoText}>◆</Text>
        </View>
      ) : name === 'logo3.svg' ? (
        <Svg height="100%" viewBox="0 0 21 20" width="100%">
          <Path d="M8.458 18.169c1.478 0 2.678-1.163 2.678-2.596v-2.595H8.458c-1.477 0-2.677 1.163-2.677 2.595 0 1.433 1.2 2.596 2.677 2.596Z" fill="#0ACF83" />
          <Path d="M5.781 10.382c0-1.433 1.2-2.595 2.677-2.595h2.678v5.191H8.458c-1.477 0-2.677-1.163-2.677-2.596Z" fill="#A259FF" />
          <Path d="M5.781 5.191c0-1.433 1.2-2.595 2.677-2.595h2.678v5.19H8.458c-1.477 0-2.677-1.162-2.677-2.595Z" fill="#F24E1E" />
          <Path d="M11.136 2.596h2.677c1.478 0 2.677 1.163 2.677 2.595 0 1.433-1.2 2.596-2.677 2.596h-2.677V2.596Z" fill="#FF7262" />
          <Path d="M16.49 10.382c0 1.433-1.2 2.596-2.677 2.596-1.478 0-2.677-1.163-2.677-2.596 0-1.433 1.2-2.595 2.677-2.595 1.478 0 2.677 1.162 2.677 2.595Z" fill="#1ABCFE" />
        </Svg>
      ) : (
        <Image
          source={{uri: asset(name)}}
          style={styles.cardImage}
        />
      )}
    </View>;
  const isSelected = (key: string) => !!selectedCards[key];
  const setSelected = (key: string, selected: boolean) =>
    setSelectedCards(current => ({...current, [key]: selected}));
  const moreAction = (
    <Button accessibilityLabel="More options" appearance="transparent" iconOnly size="small">
      •••
    </Button>
  );
  const appHeader = ({
    action = moreAction,
    description = 'Developer',
    image = 'app_logo.svg',
    title = 'App Name',
  }: {
    readonly action?: React.ReactNode;
    readonly description?: string;
    readonly image?: string;
    readonly title?: string;
  } = {}) => (
    <CardHeader
      action={action}
      description={description ? <Text style={styles.cardCaption}>{description}</Text> : undefined}
      header={<Text style={styles.cardTitle}>{title}</Text>}
      image={image ? assetImage(image, 48, styles.cardAppLogo) : undefined}
    />
  );
  const documentHeader = (image: string, title: string, description: string) => (
    <CardHeader
      description={<Text style={styles.cardCaption}>{description}</Text>}
      header={<Text style={styles.cardTitle}>{title}</Text>}
      image={<Image source={{uri: asset(image)}} style={styles.cardDocumentIcon} />}
    />
  );
  const preview = ({
    image = 'doc_template.png',
    logo = 'docx.png',
    style,
  }: {
    readonly image?: string;
    readonly logo?: string;
    readonly style?: StyleProp<ViewStyle>;
  } = {}) => (
    <NativeCardPreview
      logo={logo ? assetImage(logo, 32) : undefined}
      style={[styles.cardMedia, style]}
    >
      <Image source={{uri: asset(image)}} style={styles.cardImage} />
    </NativeCardPreview>
  );
  const defaultCardContent = (disabled = false) => (
    <>
      <CardHeader
        description={<Text style={styles.cardCaption}>5h ago · About us - Overview</Text>}
        header={<Text style={styles.cardBody}><Text style={styles.cardTitle}>Elvia Atkins</Text> mentioned you</Text>}
        image={assetImage('avatar_elvia.svg', 32, styles.cardAvatar)}
      />
      {preview()}
      <CardFooter>
        <Button disabled={disabled} size="small">↩  Reply</Button>
        <Button disabled={disabled} size="small">↗  Share</Button>
      </CardFooter>
    </>
  );
  const selectableCard = (key: string, floatingAction?: React.ReactNode) => (
    <Card
      accessibilityLabel="iOS App Prototype"
      floatingAction={floatingAction}
      onSelectionChange={(_, data) => setSelected(key, data.selected)}
      selected={isSelected(key)}
      style={styles.cardSelectable}
    >
      {preview({image: 'office1.png', logo: 'logo3.svg', style: styles.cardSelectablePreview})}
      <CardHeader
        action={moreAction}
        description={<Text style={styles.cardCaption}>You created 53m ago</Text>}
        header={<Text style={styles.cardTitle}>iOS App Prototype</Text>}
      />
    </Card>
  );
  const section = (title: string, description: string, child: React.ReactNode) => (
    <View style={styles.cardSection}>
      <Text style={styles.cardSectionTitle}>{title}</Text>
      {description ? <Text style={styles.cardSectionDescription}>{description}</Text> : null}
      {child}
    </View>
  );

  if (component.includes('Footer')) {
    return (
      <CardFooter
        action={<Button accessibilityLabel="More options" appearance="transparent" iconOnly size="small">•••</Button>}
        style={styles.cardFooterPage}
      >
        <Button size="small">↩  Reply</Button>
        <Button size="small">↗  Share</Button>
      </CardFooter>
    );
  }

  if (component.includes('Header')) {
    const header = (showImage: boolean, showDescription: boolean, showAction: boolean) => (
      <CardHeader
        action={showAction ? moreAction : undefined}
        description={showDescription ? <Text style={styles.cardCaption}>Developer</Text> : undefined}
        header={<Text style={styles.cardTitle}>App Name</Text>}
        image={showImage ? <Image source={{uri: asset('pptx.png')}} style={styles.cardDocumentIcon} /> : undefined}
        style={styles.cardHeaderPage}
      />
    );
    return (
      <View style={styles.cardHeaderPageColumn}>
        {header(true, true, true)}
        {header(false, true, true)}
        {header(true, false, true)}
        {header(true, true, false)}
        {header(false, false, true)}
        {header(false, true, false)}
        {header(true, false, false)}
        {header(false, false, false)}
      </View>
    );
  }

  if (component.includes('Preview')) {
    return preview({style: styles.cardPreviewPage});
  }

  if (includes(mode, 'orientation')) {
    return (
      <View style={styles.cardStoryColumnLarge}>
        {section(
          "'vertical' (Default)",
          'With image as part of header',
          <Card style={styles.cardOrientation}>
            {appHeader()}
            <Text style={styles.cardBody}>Donut chocolate bar oat cake. Dragée tiramisu lollipop bear claw. Marshmallow pastry jujubes toffee sugar plum.</Text>
          </Card>,
        )}
        {section(
          "'horizontal'",
          'With image as part of preview',
          <Card orientation="horizontal" style={styles.cardOrientation}>
            <NativeCardPreview style={styles.cardHorizontalPreview}>
              {assetImage('app_logo.svg', 52)}
            </NativeCardPreview>
            {appHeader({image: ''})}
          </Card>,
        )}
      </View>
    );
  }

  if (includes(mode, 'size')) {
    const sizeCard = (size: 'small' | 'medium' | 'large') => (
      <Card size={size} style={styles.cardSizeExample}>
        <View style={styles.cardIconRow}>
          {assetImage('logo.svg', 32)}
          {assetImage('logo2.svg', 32)}
        </View>
        <CardHeader
          description={<Text style={styles.cardCaption}>By Microsoft</Text>}
          header={<Text style={styles.cardTitle}>Alert in Teams when a new document is uploaded in channel</Text>}
        />
        <View style={styles.cardSpaceBetween}>
          <Text style={styles.cardBody}>Automated</Text>
          <Text style={styles.cardBody}>3290</Text>
        </View>
      </Card>
    );
    return (
      <View style={styles.cardStoryColumnLarge}>
        {section("'small'", '', sizeCard('small'))}
        {section("'medium' (Default)", '', sizeCard('medium'))}
        {section("'large'", '', sizeCard('large'))}
      </View>
    );
  }

  if (includes(mode, 'appearance')) {
    const appearanceCard = (appearance: React.ComponentProps<typeof Card>['appearance']) => (
      <Card appearance={appearance} onClick={() => undefined} style={styles.cardAppearanceExample}>
        {appHeader()}
        <Text style={styles.cardBody}>Donut chocolate bar oat cake. Dragée tiramisu lollipop bear claw. Marshmallow pastry jujubes toffee sugar plum.</Text>
      </Card>
    );
    return (
      <View style={styles.cardStoryColumnLarge}>
        {section('Filled (Default)', 'This is the default style to use for cards. Use this style variant for most of your card designs.', appearanceCard('filled'))}
        {section('Filled Alternative', 'Use this style when the card is displayed on a lighter gray or white surface.', appearanceCard('filled-alternative'))}
        {section('Outline', "Use when you don't want a filled background color but need a discernable outline.", appearanceCard('outline'))}
        {section('Subtle', "This variant has no background or border until the card is interacted with.", appearanceCard('subtle'))}
      </View>
    );
  }

  if (includes(mode, 'selectable indicator')) {
    const checkbox = (key: string) => (
      <Checkbox
        accessibilityLabel="iOS App Prototype"
        checked={isSelected(key)}
        onChange={(_, data) => setSelected(key, data.checked === true)}
      />
    );
    return (
      <View style={styles.cardStoryRows}>
        <View style={styles.cardStoryRow}>{selectableCard('indicator-1', checkbox('indicator-1'))}{selectableCard('indicator-2', checkbox('indicator-2'))}</View>
        <View style={styles.cardStoryRow}>
          <Card
            accessibilityLabel="Secret Project Briefing"
            floatingAction={checkbox('indicator-3')}
            onSelectionChange={(_, data) => setSelected('indicator-3', data.selected)}
            selected={isSelected('indicator-3')}
            style={styles.cardSelectable}
          >
            {documentHeader('docx.png', 'Secret Project Briefing', 'OneDrive > Documents')}
          </Card>
          <Card
            accessibilityLabel="Team Budget"
            floatingAction={checkbox('indicator-4')}
            onSelectionChange={(_, data) => setSelected('indicator-4', data.selected)}
            selected={isSelected('indicator-4')}
            style={styles.cardSelectable}
          >
            {documentHeader('xlsx.png', 'Team Budget', 'OneDrive > Spreadsheets')}
          </Card>
        </View>
      </View>
    );
  }

  if (includes(mode, 'selectable')) {
    return <View style={styles.cardStoryRow}>{selectableCard('selectable-1')}{selectableCard('selectable-2')}</View>;
  }

  if (includes(mode, 'disabled')) {
    const disabledCard = ({
      appearance = 'filled',
      disabled = false,
      interactive = false,
      keyName,
      selectable = false,
      withCheckbox = false,
    }: {
      readonly appearance?: React.ComponentProps<typeof Card>['appearance'];
      readonly disabled?: boolean;
      readonly interactive?: boolean;
      readonly keyName: string;
      readonly selectable?: boolean;
      readonly withCheckbox?: boolean;
    }) => (
      <Card
        appearance={appearance}
        disabled={disabled}
        floatingAction={
          withCheckbox ? (
            <Checkbox
              checked={isSelected(keyName)}
              disabled={disabled}
              onChange={(_, data) => setSelected(keyName, data.checked === true)}
            />
          ) : undefined
        }
        onClick={interactive ? () => undefined : undefined}
        onSelectionChange={selectable ? (_, data) => setSelected(keyName, data.selected) : undefined}
        selected={selectable ? isSelected(keyName) : undefined}
        style={styles.cardDisabledExample}
      >
        {defaultCardContent(disabled)}
      </Card>
    );
    return (
      <View style={styles.cardStoryColumnLarge}>
        {section('Default Card', '', <View style={styles.cardStoryRow}>{disabledCard({keyName: 'default'})}{disabledCard({disabled: true, keyName: 'default-disabled'})}</View>)}
        {section('Interactive Card', '', <View style={styles.cardStoryRow}>{disabledCard({interactive: true, keyName: 'interactive'})}{disabledCard({disabled: true, interactive: true, keyName: 'interactive-disabled'})}</View>)}
        {section('Selectable Card', '', <View style={styles.cardStoryRows}><View style={styles.cardStoryRow}>{disabledCard({keyName: 'selectable', selectable: true})}{disabledCard({disabled: true, keyName: 'selectable-disabled', selectable: true})}</View><View style={styles.cardStoryRow}>{disabledCard({keyName: 'checkbox', selectable: true, withCheckbox: true})}{disabledCard({disabled: true, keyName: 'checkbox-disabled', selectable: true, withCheckbox: true})}</View></View>)}
        {section('Outline Card', '', <View style={styles.cardStoryRow}>{disabledCard({appearance: 'outline', keyName: 'outline'})}{disabledCard({appearance: 'outline', disabled: true, keyName: 'outline-disabled'})}</View>)}
      </View>
    );
  }

  if (includes(mode, 'with action')) {
    const actionCard = (linked = false) => (
      <Card accessibilityLabel={linked ? 'Linked Card' : 'Card with click event'} focusMode="off" onClick={() => undefined} style={styles.cardActionExample}>
        {preview({image: 'office2.png', logo: '', style: styles.cardActionPreview})}
        <CardHeader
          action={moreAction}
          description={<Text style={styles.cardCaption}>Developer</Text>}
          header={<Text style={[styles.cardTitle, linked && styles.cardLink]}>App Name</Text>}
          image={<Image source={{uri: asset('pptx.png')}} style={styles.cardDocumentIcon} />}
        />
        {!linked ? <Text style={styles.cardBody}>Donut chocolate bar oat cake. Dragée tiramisu lollipop bear claw. Marshmallow pastry jujubes toffee sugar plum.</Text> : null}
        {!linked ? <CardFooter><Button appearance="primary" size="small">↗  Open</Button></CardFooter> : null}
      </Card>
    );
    return (
      <View style={styles.cardStoryColumnLarge}>
        {section('Card with click event', 'This card has both a root click event and an Open button that performs the same action.', actionCard())}
        {section('Linked Card', "When a card has no separate button, its title is the additional interactive element.", actionCard(true))}
      </View>
    );
  }

  if (includes(mode, 'focus mode')) {
    const focusCard = (focusMode: React.ComponentProps<typeof Card>['focusMode']) => (
      <Card focusMode={focusMode} style={styles.cardFocusExample}>
        {preview({image: 'sales_template.png', logo: '', style: styles.cardFocusPreview})}
        {appHeader({image: 'pptx.png'})}
        <Text style={styles.cardBody}>Donut chocolate bar oat cake. Dragée tiramisu lollipop bear claw. Marshmallow pastry jujubes toffee sugar plum.</Text>
        <CardFooter><Button appearance="primary" size="small">↗  Open</Button><Button size="small">↗  Share</Button></CardFooter>
      </Card>
    );
    return (
      <View style={styles.cardStoryColumnLarge}>
        {section("'off' (Default)", "The contents may still be focusable, but the Card won't manage focus.", focusCard('off'))}
        {section("'no-tab'", 'The Card is focusable and traps focus until Esc.', focusCard('no-tab'))}
        {section("'tab-exit'", 'The Card is focusable and releases focus on Esc or Tab.', focusCard('tab-exit'))}
        {section("'tab-only'", 'The Card does not trap focus but supports Tab navigation.', focusCard('tab-only'))}
      </View>
    );
  }

  if (includes(mode, 'templates')) {
    const task = (key: string) => (
      <View style={styles.cardTaskRow}>
        <Checkbox accessibilityLabel={`Select ${key}`} />
        <View style={styles.cardTaskText}>
          <Text style={styles.cardTitle}>Task title</Text>
          <Text style={styles.cardCaption}>Donut chocolate bar oat cake. Dragée tiramisu lollipop bear claw. Marshmallow pastry jujubes toffee sugar plum.</Text>
        </View>
      </View>
    );
    return (
      <View style={styles.cardTemplateRow}>
        <Card style={styles.cardTemplate}>
          <View style={styles.cardBadgeRow}>
            <Badge appearance="tint" color="danger">Red</Badge>
            <Badge appearance="tint" color="success">Green</Badge>
            <Badge appearance="tint" color="brand">Blue</Badge>
          </View>
          {task('task one')}
          {task('task two')}
          <Text style={styles.cardBody}>●  ◐  ⌕ 4   ✓ 2/12   ◯</Text>
        </Card>
        <Card style={styles.cardTemplate}>
          {preview({image: 'intelligence.png', logo: '', style: styles.cardIntelligencePreview})}
        </Card>
        <View style={styles.cardTemplateList}>
          <Card size="small" style={styles.cardTemplate}>{documentHeader('pptx.png', 'Team Offsite 2020', 'OneDrive > Presentations')}</Card>
          <Card size="small" style={styles.cardTemplate}>{documentHeader('xlsx.png', 'Team Budget', 'OneDrive > Spreadsheets')}</Card>
          <Card size="small" style={styles.cardTemplate}>{documentHeader('docx.png', 'Secret Project Briefing', 'OneDrive > Documents')}</Card>
        </View>
      </View>
    );
  }

  return <Card style={styles.cardDefaultExample}>{defaultCardContent()}</Card>;
}

function ComboboxPreview({mode}: {readonly mode: string}): React.ReactElement {
  const animals = ['Cat', 'Dog', 'Ferret', 'Fish', 'Hamster', 'Snake'];
  const colors = ['Red', 'Green', 'Blue'];
  const [controlledSelection, setControlledSelection] = React.useState(['eatkins']);
  const [controlledValue, setControlledValue] = React.useState('Elvia Atkins');
  const [filterQuery, setFilterQuery] = React.useState('');
  const [freeformQuery, setFreeformQuery] = React.useState('');
  const [multiSelection, setMultiSelection] = React.useState<string[]>([]);
  const [tagSelection, setTagSelection] = React.useState<string[]>([]);
  const [valueSelection, setValueSelection] = React.useState<string[]>([]);
  const [valueText, setValueText] = React.useState('');
  const [activeOption, setActiveOption] = React.useState('');
  const [controlledOpen, setControlledOpen] = React.useState(false);
  const personaOptions = [
    {name: 'Katri Athokas', presence: 'Available', value: 'kathok'},
    {name: 'Elvia Atkins', presence: 'Busy', value: 'eatkins'},
    {name: 'Cameron Evans', presence: 'Away', value: 'cevans'},
    {name: 'Wanda Howard', presence: 'Out of office', value: 'whoward'},
  ];
  const controlStyle = styles.comboboxControl;
  const optionElements = (values: readonly string[], disabledValue?: string) =>
    values.map(option => (
      <ComboboxOption disabled={option === disabledValue} key={option}>
        {option}
      </ComboboxOption>
    ));
  const field = (
    label: string,
    control: React.ReactElement,
    description?: React.ReactNode,
  ) => (
    <View style={styles.comboboxField}>
      <Text style={styles.comboboxLabel}>{label}</Text>
      {control}
      {description}
    </View>
  );
  const personaOptionElements = personaOptions.map((option, index) => (
    <ComboboxOption key={option.value} text={option.name} value={option.value}>
      <View style={styles.comboboxPersona}>
        <Avatar color="colorful" name={option.name} size={32} />
        <View style={styles.comboboxPersonaText}>
          <Text style={styles.comboboxPersonaName}>{option.name}</Text>
          <Text style={styles.comboboxPersonaStatus}>{option.presence}</Text>
        </View>
        <View
          style={[
            styles.comboboxPresence,
            index === 1 && styles.comboboxPresenceBusy,
            index === 2 && styles.comboboxPresenceAway,
            index === 3 && styles.comboboxPresenceOut,
          ]}
        />
      </View>
    </ComboboxOption>
  ));

  if (includes(mode, 'complex options')) {
    return field(
      'Schedule a meeting',
      <Combobox accessibilityLabel="Schedule a meeting" style={controlStyle}>
        {personaOptionElements}
      </Combobox>,
    );
  }

  if (includes(mode, 'custom options')) {
    return field(
      'Best pet',
      <Combobox accessibilityLabel="Best pet" placeholder="Select an animal" style={controlStyle}>
        <ComboboxOptionGroup label="Land" labelStyle={styles.comboboxCustomGroupLabel}>
          {['Cat', 'Dog', 'Ferret', 'Hamster'].map(option => (
            <ComboboxOption
              checkIcon={<Text style={styles.comboboxCustomCheck}>●</Text>}
              disabled={option === 'Ferret'}
              key={option}
            >
              {option}
            </ComboboxOption>
          ))}
        </ComboboxOptionGroup>
        <ComboboxOptionGroup label="Sea" labelStyle={styles.comboboxCustomGroupLabel}>
          {['Fish', 'Jellyfish', 'Octopus', 'Seal'].map(option => (
            <ComboboxOption checkIcon={<Text style={styles.comboboxCustomCheck}>●</Text>} key={option}>
              {option}
            </ComboboxOption>
          ))}
        </ComboboxOptionGroup>
      </Combobox>,
    );
  }

  if (includes(mode, 'controlled')) {
    return (
      <View style={styles.comboboxStoryStack}>
        {field(
          'Schedule a meeting (default selection)',
          <Combobox
            accessibilityLabel="Schedule a meeting (default selection)"
            defaultSelectedOptions={['eatkins']}
            defaultValue="Elvia Atkins"
            style={controlStyle}
          >
            {personaOptionElements}
          </Combobox>,
        )}
        {field(
          'Schedule a meeting (controlled selection)',
          <Combobox
            accessibilityLabel="Schedule a meeting (controlled selection)"
            onChangeText={setControlledValue}
            onOptionSelect={(_, data) => {
              setControlledSelection(data.selectedOptions);
              setControlledValue(data.optionText ?? '');
            }}
            selectedOptions={controlledSelection}
            style={controlStyle}
            value={controlledValue}
          >
            {personaOptionElements}
          </Combobox>,
        )}
      </View>
    );
  }

  if (includes(mode, 'clearable')) {
    return field(
      'Pick a color',
      <Combobox accessibilityLabel="Pick a color" clearable placeholder="Select a color" style={controlStyle}>
        {optionElements(colors)}
      </Combobox>,
    );
  }

  if (includes(mode, 'filtering')) {
    const matches = animals.filter(option =>
      option.toLocaleLowerCase().includes(filterQuery.toLocaleLowerCase()),
    );
    return field(
      'Best pet',
      <Combobox
        accessibilityLabel="Best pet"
        onChangeText={setFilterQuery}
        onOptionSelect={(_, data) => setFilterQuery(data.optionText ?? '')}
        placeholder="Select an animal"
        style={controlStyle}
        value={filterQuery}
      >
        {matches.length ? (
          optionElements(matches, 'Ferret')
        ) : (
          <ComboboxOption disabled>No animals match your search.</ComboboxOption>
        )}
      </Combobox>,
    );
  }

  if (includes(mode, 'freeform')) {
    const matches = [
      'Cat',
      'Caterpillar',
      'Catfish',
      'Cheetah',
      'Chicken',
      'Cockatiel',
      'Cow',
      'Dog',
      'Dolphin',
      'Ferret',
      'Firefly',
      'Fish',
      'Fox',
      'Fox Terrier',
      'Frog',
      'Hamster',
      'Snake',
    ].filter(option => option.toLocaleLowerCase().startsWith(freeformQuery.toLocaleLowerCase()));
    const showCustom = freeformQuery.length > 0 && matches.length === 0;
    return field(
      'Find pets',
      <Combobox
        accessibilityLabel="Find pets"
        freeform
        onChangeText={setFreeformQuery}
        onOptionSelect={(_, data) => setFreeformQuery(data.optionText ?? '')}
        placeholder="Select an animal"
        style={controlStyle}
        value={freeformQuery}
      >
        {showCustom ? (
          <ComboboxOption text={freeformQuery}>Search for "{freeformQuery}"</ComboboxOption>
        ) : null}
        {optionElements(matches)}
      </Combobox>,
    );
  }

  if (includes(mode, 'multiselect with tags')) {
    return (
      <View style={styles.comboboxField}>
        <Text style={styles.comboboxLabel}>Best pets</Text>
        {tagSelection.length ? (
          <View style={styles.comboboxTagRow}>
            {tagSelection.map(option => (
              <Button
                accessibilityLabel={`Remove ${option}`}
                appearance="primary"
                key={option}
                onClick={() => setTagSelection(current => current.filter(item => item !== option))}
                shape="circular"
                size="small"
              >
                {option}  ×
              </Button>
            ))}
          </View>
        ) : null}
        <Combobox
          accessibilityLabel="Best pets"
          multiselect
          onOptionSelect={(_, data) => setTagSelection(data.selectedOptions)}
          placeholder="Select one or more animals"
          selectedOptions={tagSelection}
          style={controlStyle}
        >
          {optionElements(animals)}
        </Combobox>
      </View>
    );
  }

  if (includes(mode, 'multiselect with value string')) {
    return field(
      'Best pets',
      <Combobox
        accessibilityLabel="Best pets"
        inputProps={{
          onBlur: () => setValueText(valueSelection.join(', ')),
          onFocus: () => setValueText(''),
        }}
        multiselect
        onChangeText={setValueText}
        onOptionSelect={(_, data) => {
          setValueSelection(data.selectedOptions);
          setValueText('');
        }}
        placeholder="Select one or more animals"
        selectedOptions={valueSelection}
        style={controlStyle}
        value={valueText}
      >
        {optionElements(animals)}
      </Combobox>,
    );
  }

  if (includes(mode, 'multiselect')) {
    return field(
      'Best pets',
      <Combobox
        accessibilityLabel="Best pets"
        multiselect
        onOptionSelect={(_, data) => setMultiSelection(data.selectedOptions)}
        placeholder="Select one or more animals"
        selectedOptions={multiSelection}
        style={controlStyle}
      >
        {optionElements(animals, 'Ferret')}
      </Combobox>,
      multiSelection.length ? (
        <Text style={styles.comboboxDescription}>Chosen pets: {multiSelection.join(', ')}</Text>
      ) : null,
    );
  }

  if (includes(mode, 'grouped')) {
    return field(
      'Best pet',
      <Combobox accessibilityLabel="Best pet" placeholder="Select an animal" style={controlStyle}>
        <ComboboxOptionGroup label="Land">
          {optionElements(['Cat', 'Dog', 'Ferret', 'Hamster'], 'Ferret')}
        </ComboboxOptionGroup>
        <ComboboxOptionGroup label="Sea">
          {optionElements(['Fish', 'Jellyfish', 'Octopus', 'Seal'])}
        </ComboboxOptionGroup>
      </Combobox>,
    );
  }

  if (includes(mode, 'appearance')) {
    const appearanceField = (
      label: string,
      appearance: React.ComponentProps<typeof Combobox>['appearance'],
      inverted = false,
    ) => (
      <View style={[styles.comboboxAppearanceField, inverted && styles.comboboxAppearanceInverted]}>
        <Text style={[styles.comboboxLabel, inverted && styles.comboboxLabelInverted]}>{label}</Text>
        <Combobox
          accessibilityLabel={label}
          appearance={appearance}
          placeholder="Select a color"
          style={controlStyle}
        >
          {optionElements(colors)}
        </Combobox>
      </View>
    );
    return (
      <View style={styles.comboboxAppearanceStack}>
        {appearanceField('Outline', 'outline')}
        {appearanceField('Underline', 'underline')}
        {appearanceField('Filled Darker', 'filled-darker', true)}
        {appearanceField('Filled Lighter', 'filled-lighter', true)}
      </View>
    );
  }

  if (includes(mode, 'size')) {
    return (
      <View style={styles.comboboxStoryStack}>
        {field(
          'Small',
          <Combobox accessibilityLabel="Small" placeholder="Select a color" size="small" style={controlStyle}>
            {optionElements(colors)}
          </Combobox>,
        )}
        {field(
          'Medium',
          <Combobox accessibilityLabel="Medium" placeholder="Select a color" size="medium" style={controlStyle}>
            {optionElements(colors)}
          </Combobox>,
        )}
        {field(
          'Large',
          <Combobox accessibilityLabel="Large" placeholder="Select a color" size="large" style={controlStyle}>
            {optionElements(colors)}
          </Combobox>,
        )}
      </View>
    );
  }

  if (includes(mode, 'disabled')) {
    return field(
      'Best pet',
      <Combobox
        accessibilityLabel="Best pet"
        disabled
        placeholder="Select an animal"
        style={controlStyle}
      >
        {optionElements(animals)}
      </Combobox>,
    );
  }

  if (includes(mode, 'virtualizer')) {
    return field(
      'Medium',
      <Combobox accessibilityLabel="Medium" placeholder="Select a number" style={controlStyle}>
        {Array.from({length: 200}, (_, index) => (
          <ComboboxOption key={index} value={String(index)}>
            Item {index + 1}
          </ComboboxOption>
        ))}
      </Combobox>,
    );
  }

  if (includes(mode, 'active option change')) {
    return (
      <View style={styles.comboboxField}>
        <Text style={styles.comboboxActiveOption}>{activeOption}</Text>
        <Text style={styles.comboboxLabel}>Best pet</Text>
        <Combobox
          accessibilityLabel="Best pet"
          onActiveOptionChange={(_, data) => setActiveOption(data.nextOption?.text ?? '')}
          placeholder="Select an animal"
          style={controlStyle}
        >
          {optionElements(animals, 'Ferret')}
        </Combobox>
      </View>
    );
  }

  if (includes(mode, 'controlling open and close')) {
    return (
      <View style={styles.comboboxField}>
        <Checkbox
          checked={controlledOpen}
          label="open"
          onChange={(_, data) => setControlledOpen(data.checked === true)}
        />
        <Text style={styles.comboboxLabel}>Best pet</Text>
        <Combobox
          accessibilityLabel="Best pet"
          onOpenChange={(_, data) => setControlledOpen(data.open)}
          open={controlledOpen}
          placeholder="Select an animal"
          style={controlStyle}
        >
          {optionElements(animals, 'Ferret')}
        </Combobox>
      </View>
    );
  }

  return field(
    'Best pet',
    <Combobox accessibilityLabel="Best pet" placeholder="Select an animal" style={controlStyle}>
      {optionElements(animals, 'Ferret')}
    </Combobox>,
  );
}

function ChoiceInputPreview({component, mode}: FluentCatalogPreviewProps): React.ReactElement {
  const [value, setValue] = React.useState('');
  const [expanded, setExpanded] = React.useState(false);
  const disabled = includes(mode, 'disabled');
  const multiline = component.includes('Textarea');
  const search = component.includes('Search');
  const spin = component.includes('Spin');
  const choice = ['Combobox', 'Dropdown', 'Select'].includes(component);
  const field = component === 'Field';
  const inline = includes(mode, 'inline');
  const label = component.split(' / ').at(-1);

  return (
    <View style={[styles.inputGroup, inline && styles.inputGroupInline]}>
      {!includes(mode, 'no label') ? <Text style={styles.label}>{field ? 'Example field' : label}</Text> : null}
      {includes(mode, 'hint', 'description') ? <Text style={styles.caption}>Helpful description for this field.</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          editable={!disabled}
          multiline={multiline}
          onChangeText={setValue}
          placeholder={search ? 'Search' : spin ? '0' : 'Type a value'}
          style={[styles.input, multiline && styles.textarea, disabled && styles.disabledSurface]}
          value={value}
        />
        {choice ? <Button disabled={disabled} onClick={() => setExpanded(current => !current)} size="small">v</Button> : null}
        {search && value ? <Button accessibilityLabel="Clear search" onClick={() => setValue('')} size="small">x</Button> : null}
        {spin ? <View><Button onClick={() => setValue(String((Number(value) || 0) + 1))} size="small">+</Button><Button onClick={() => setValue(String((Number(value) || 0) - 1))} size="small">-</Button></View> : null}
      </View>
      {expanded ? (
        <View style={styles.choicePopup}>
          {['Option one', 'Option two', 'Option three'].map(option => (
            <Pressable key={option} onPress={() => { setValue(option); setExpanded(false); }} style={styles.choiceOption}>
              <Text style={styles.body}>{option}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {includes(mode, 'validation', 'error') ? <Text style={styles.errorText}>Enter a valid value.</Text> : null}
      {includes(mode, 'success') ? <Text style={styles.successText}>Looks good.</Text> : null}
      {includes(mode, 'required') ? <Text style={styles.caption}>Required</Text> : null}
    </View>
  );
}

function CheckboxPreview({mode}: {readonly mode: string}): React.ReactElement {
  const [checked, setChecked] = React.useState(true);
  const [option1, setOption1] = React.useState(false);
  const [option2, setOption2] = React.useState(true);
  const [option3, setOption3] = React.useState(false);

  if (mode === 'Checked') {
    return (
      <Checkbox checked={checked} label="Checked" onChange={(_, data) => setChecked(data.checked === true)} />
    );
  }

  if (mode === 'Mixed') {
    const allChecked = option1 && option2 && option3;
    const noneChecked = !(option1 || option2 || option3);
    return (
      <View style={styles.column}>
        <Checkbox
          checked={allChecked ? true : noneChecked ? false : 'mixed'}
          label="All options"
          onChange={(_, data) => {
            const nextChecked = data.checked === true;
            setOption1(nextChecked);
            setOption2(nextChecked);
            setOption3(nextChecked);
          }}
        />
        <Checkbox checked={option1} label="Option 1" onChange={() => setOption1(value => !value)} />
        <Checkbox checked={option2} label="Option 2" onChange={() => setOption2(value => !value)} />
        <Checkbox checked={option3} label="Option 3" onChange={() => setOption3(value => !value)} />
      </View>
    );
  }

  if (mode === 'Disabled') {
    return (
      <View style={styles.column}>
        <Checkbox disabled label="Disabled" />
        <Checkbox checked disabled label="Disabled checked" />
        <Checkbox checked="mixed" disabled label="Disabled mixed" />
      </View>
    );
  }

  if (mode === 'Large') {
    return <Checkbox label="Large" size="large" />;
  }

  if (mode === 'Label Before') {
    return <Checkbox label="Label before" labelPosition="before" />;
  }

  if (mode === 'Label Wrapping') {
    return (
      <Checkbox
        label="Here is an example of a checkbox with a long label and it starts to wrap to a second line"
        style={{ maxWidth: 400 }}
      />
    );
  }

  if (mode === 'Required') {
    return <Checkbox label="Required" required />;
  }

  if (mode === 'Circular') {
    return <Checkbox label="Circular" shape="circular" />;
  }

  return <Checkbox />;
}

function SelectionPreview({component, mode}: FluentCatalogPreviewProps): React.ReactElement {
  const [checked, setChecked] = React.useState(includes(mode, 'checked', 'selected', 'mixed'));

  if (component === 'Radio Group') {
    return (
      <RadioGroup label={includes(mode, 'label') ? 'Favorite fruit' : 'Options'} selectedKey="one">
        <RadioButton buttonKey="one" content="First option" />
        <RadioButton buttonKey="two" content="Second option" />
        <RadioButton buttonKey="three" content="Unavailable" disabled />
      </RadioGroup>
    );
  }

  if (component === 'Tab List') {
    const vertical = includes(mode, 'vertical');
    return (
      <TabList selectedKey="one" vertical={vertical}>
        <Tab tabKey="one">Overview</Tab>
        <Tab tabKey="two">Details</Tab>
        {includes(mode, 'icon') ? <Tab tabKey="icon">★ Favorites</Tab> : null}
        <Tab disabled tabKey="three">Disabled</Tab>
      </TabList>
    );
  }

  return (
    <View style={styles.switchPreview}>
      <NativeSwitch disabled={includes(mode, 'disabled')} onValueChange={setChecked} value={checked} />
      <Text style={styles.body}>{includes(mode, 'label') ? 'Switch label' : mode}</Text>
    </View>
  );
}

function ColorPreview({mode}: {readonly mode: string}): React.ReactElement {
  const [selected, setSelected] = React.useState(colors[0]);
  return (
    <View style={styles.row}>
      {colors.map(color => (
        <Pressable
          accessibilityLabel={`Select ${color}`}
          key={color}
          onPress={() => setSelected(color)}
          style={[styles.swatch, {backgroundColor: color}, selected === color && styles.swatchSelected]}
        />
      ))}
      <Text style={styles.caption}>{includes(mode, 'grid') ? 'Grid' : selected}</Text>
    </View>
  );
}

function DataPreview({component, mode}: FluentCatalogPreviewProps): React.ReactElement {
  const [selectedRows, setSelectedRows] = React.useState<number[]>(includes(mode, 'selection') ? [0] : []);
  const [descending, setDescending] = React.useState(false);
  const rows = includes(mode, 'empty')
    ? []
    : [
        ['Meeting notes', 'Max Mustermann', '7h ago', 'You edited this'],
        ['Thursday presentation', 'Erika Mustermann', 'Yesterday at 1:45 PM', 'You recently opened this'],
        ['Training recording', 'John Doe', 'Yesterday at 1:45 PM', 'You recently opened this'],
        ['Purchase order', 'Jane Doe', 'Tue at 9:30 AM', 'You shared this in a Teams chat'],
      ];
  const selectable = includes(mode, 'selection');
  const sortable = includes(mode, 'sort');
  const visibleRows = descending ? [...rows].reverse() : rows;

  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        {selectable ? <Text style={styles.tableSelectionCell}>Select</Text> : null}
        <Pressable
          disabled={!sortable}
          onPress={() => setDescending(current => !current)}
          style={styles.tableCell}
        >
          <Text style={styles.tableHeaderText}>Name{sortable ? (descending ? '  v' : '  ^') : ''}</Text>
        </Pressable>
        <Text style={styles.tableCell}>Author</Text>
        <Text style={styles.tableCell}>Last updated</Text>
        <Text style={styles.tableCell}>Last update</Text>
      </View>
      {visibleRows.map((row, index) => (
        <Pressable
          key={row[0]}
          onPress={() =>
            selectable &&
            setSelectedRows(current =>
              current.includes(index) ? current.filter(value => value !== index) : [...current, index],
            )
          }
          style={[styles.tableRow, selectedRows.includes(index) && styles.tableSelectedRow]}
        >
          {selectable ? <Text style={styles.tableSelectionCell}>{selectedRows.includes(index) ? '[x]' : '[ ]'}</Text> : null}
          {row.map(value => <Text key={value} style={styles.tableCell}>{value}</Text>)}
        </Pressable>
      ))}
      {rows.length === 0 ? <Text style={styles.emptyText}>No {component.toLocaleLowerCase()} rows</Text> : null}
      {includes(mode, 'virtualization') ? <Text style={styles.caption}>Virtualized rows continue below the visible set.</Text> : null}
      {includes(mode, 'resizable') ? <Text style={styles.caption}>Drag column dividers to resize.</Text> : null}
    </View>
  );
}

          interface CatalogDataGridItem {
            author: {
              label: string;
              status: 'available' | 'away' | 'busy' | 'offline';
            };
            file: {
              icon: string;
              label: string;
            };
            lastUpdate: {
              icon: string;
              label: string;
            };
            lastUpdated: {
              label: string;
              timestamp: number;
            };
          }

          const catalogDataGridItems: CatalogDataGridItem[] = [
            {
              author: {label: 'Max Mustermann', status: 'available'},
              file: {icon: '\ue8a5', label: 'Meeting notes'},
              lastUpdate: {icon: '\ue70f', label: 'You edited this'},
              lastUpdated: {label: '7h ago', timestamp: 1},
            },
            {
              author: {label: 'Erika Mustermann', status: 'busy'},
              file: {icon: '\ue8b7', label: 'Thursday presentation'},
              lastUpdate: {icon: '\ue8a7', label: 'You recently opened this'},
              lastUpdated: {label: 'Yesterday at 1:45 PM', timestamp: 2},
            },
            {
              author: {label: 'John Doe', status: 'away'},
              file: {icon: '\ue714', label: 'Training recording'},
              lastUpdate: {icon: '\ue8a7', label: 'You recently opened this'},
              lastUpdated: {label: 'Yesterday at 1:45 PM', timestamp: 2},
            },
            {
              author: {label: 'Jane Doe', status: 'offline'},
              file: {icon: '\uea90', label: 'Purchase order'},
              lastUpdate: {icon: '\ue716', label: 'You shared this in a Teams chat'},
              lastUpdated: {label: 'Tue at 9:30 AM', timestamp: 3},
            },
          ];

          function DataGridCellLayout({
            children,
            icon,
          }: React.PropsWithChildren<{readonly icon?: string}>): React.ReactElement {
            return (
              <View style={styles.dataGridCellLayout}>
                {icon ? <Text style={styles.dataGridIcon}>{icon}</Text> : null}
                <Text numberOfLines={1} style={styles.dataGridCellText}>{children}</Text>
              </View>
            );
          }

          function DataGridPreview({mode}: {readonly mode: string}): React.ReactElement {
            const [controlledSelection, setControlledSelection] = React.useState<Set<DataGridRowId>>(
              new Set<DataGridRowId>(includes(mode, 'custom row id') ? ['Thursday presentation'] : [1]),
            );
            const [sortState, setSortState] = React.useState<DataGridSortState>({
              sortColumn: 'file',
              sortDirection: 'ascending',
            });
            const [actionMessage, setActionMessage] = React.useState('');
            const [headerMenuOpen, setHeaderMenuOpen] = React.useState(false);
            const focusable = includes(mode, 'focusable elements');
            const sortableStory = includes(mode, 'sort') || mode === 'Default';
            const controlledSort = includes(mode, 'sort controlled');
            const multipleSelect =
              mode === 'Default' ||
              includes(mode, 'composite', 'multiple select', 'subtle selection', 'selection appearance', 'resizable', 'custom row id', 'focusable');
            const singleSelect = includes(mode, 'single select');
            const controlledSelectionStory = includes(mode, 'controlled', 'custom row id') && !controlledSort;
            const defaultSelectionStory =
              !controlledSelectionStory &&
              includes(mode, 'multiple select', 'single select', 'subtle selection', 'selection appearance');
            const selectionMode = singleSelect ? 'single' : multipleSelect ? 'multiselect' : 'none';
            const cell = (value: string, icon?: string) => <DataGridCellLayout icon={icon}>{value}</DataGridCellLayout>;
            const authorCell = (item: CatalogDataGridItem) => (
              <View style={styles.dataGridCellLayout}>
                <Avatar
                  badge={<PresenceBadge size="small" status={item.author.status} />}
                  name={item.author.label}
                  size={24}
                />
                <Text numberOfLines={1} style={styles.dataGridCellText}>{item.author.label}</Text>
              </View>
            );
            const standardColumns: DataGridColumn<CatalogDataGridItem>[] = [
              {
                columnId: 'file',
                compare: (a, b) => a.file.label.localeCompare(b.file.label),
                header: 'File',
                renderCell: item => cell(item.file.label, item.file.icon),
              },
              {
                columnId: 'author',
                compare: (a, b) => a.author.label.localeCompare(b.author.label),
                header: focusable ? (
                  <View style={styles.dataGridHeaderActions}>
                    <Text style={styles.dataGridHeaderLabel}>Author</Text>
                    <Button accessibilityLabel="Edit author column" onClick={() => setActionMessage('Edit author column')} size="small">✎</Button>
                    <Button accessibilityLabel="More author options" onClick={() => setHeaderMenuOpen(value => !value)} size="small">•••</Button>
                  </View>
                ) : 'Author',
                renderCell: authorCell,
              },
              focusable
                ? {
                    columnId: 'singleAction',
                    header: 'Single action',
                    renderCell: item => (
                      <Button onClick={() => setActionMessage(`Opened ${item.file.label}`)} size="small">Open</Button>
                    ),
                  }
                : {
                    columnId: 'lastUpdated',
                    compare: (a, b) => a.lastUpdated.timestamp - b.lastUpdated.timestamp,
                    header: 'Last updated',
                    renderCell: item => item.lastUpdated.label,
                  },
              focusable
                ? {
                    columnId: 'actions',
                    header: 'Actions',
                    renderCell: item => (
                      <View style={styles.dataGridCellActions}>
                        <Button accessibilityLabel={`Edit ${item.file.label}`} onClick={() => setActionMessage(`Edited ${item.file.label}`)} size="small">✎</Button>
                        <Button accessibilityLabel={`Delete ${item.file.label}`} onClick={() => setActionMessage(`Deleted ${item.file.label}`)} size="small">×</Button>
                      </View>
                    ),
                  }
                : {
                    columnId: 'lastUpdate',
                    compare: includes(mode, 'sort') && !controlledSort ? undefined : (a, b) => a.lastUpdate.label.localeCompare(b.lastUpdate.label),
                    header: includes(mode, 'sort') && !controlledSort ? 'Not sortable' : 'Last update',
                    renderCell: item => cell(item.lastUpdate.label, item.lastUpdate.icon),
                  },
            ];
            const columnSizingOptions = {
              author: {defaultWidth: 180, idealWidth: 180, minWidth: 120},
              file: {defaultWidth: includes(mode, 'disable auto fit') ? 180 : 120, minWidth: 80},
            };
            const virtualizedItems = React.useMemo(
              () =>
                Array.from({length: 100}, (_, index) => ({
                  ...catalogDataGridItems[index % catalogDataGridItems.length],
                  file: {
                    ...catalogDataGridItems[index % catalogDataGridItems.length].file,
                    label: `${catalogDataGridItems[index % catalogDataGridItems.length].file.label} ${index + 1}`,
                  },
                })),
              [],
            );
            const grid = (
              <DataGrid
                columns={standardColumns}
                columnSizingOptions={includes(mode, 'resizable') ? columnSizingOptions : undefined}
                defaultSelectedItems={defaultSelectionStory ? new Set<DataGridRowId>([1]) : undefined}
                defaultSortState={includes(mode, 'sort') && !controlledSort ? sortState : undefined}
                focusMode={includes(mode, 'composite') || mode === 'Default' ? 'composite' : 'cell'}
                getRowId={includes(mode, 'custom row id') || mode === 'Default' || focusable || includes(mode, 'resizable')
                  ? item => item.file.label
                  : undefined}
                items={includes(mode, 'virtualization') ? virtualizedItems : catalogDataGridItems}
                maxVisibleRows={8}
                onSelectionChange={
                  controlledSelectionStory ? (_, data) => setControlledSelection(new Set(data.selectedItems)) : undefined
                }
                onSortChange={controlledSort ? (_, data) => setSortState(data) : undefined}
                resizableColumns={includes(mode, 'resizable')}
                selectedItems={controlledSelectionStory ? controlledSelection : undefined}
                selectionAppearance={includes(mode, 'selection appearance') ? 'neutral' : 'brand'}
                selectionMode={selectionMode}
                sortable={sortableStory || includes(mode, 'resizable', 'focusable')}
                sortState={controlledSort ? sortState : undefined}
                style={styles.dataGrid}
                subtleSelection={includes(mode, 'subtle selection')}
                virtualized={includes(mode, 'virtualization')}
              />
            );

            if (includes(mode, 'custom row id')) {
              return (
                <View style={styles.dataGridStoryStack}>
                  {catalogDataGridItems.map(item => (
                    <Checkbox
                      checked={controlledSelection.has(item.file.label)}
                      key={item.file.label}
                      label={item.file.label}
                      onChange={event => {
                        const next = new Set(controlledSelection);
                        if (next.has(item.file.label)) next.delete(item.file.label);
                        else next.add(item.file.label);
                        setControlledSelection(next);
                      }}
                    />
                  ))}
                  {grid}
                </View>
              );
            }

            return (
              <View style={styles.dataGridStoryStack}>
                {focusable && headerMenuOpen ? (
                  <View style={styles.dataGridMenu}>
                    <Button onClick={() => { setActionMessage('Deleted author column'); setHeaderMenuOpen(false); }} size="small">Delete column</Button>
                    <Button onClick={() => { setActionMessage('Created new author'); setHeaderMenuOpen(false); }} size="small">Create new author</Button>
                  </View>
                ) : null}
                {grid}
                {actionMessage ? <Text style={styles.caption}>{actionMessage}</Text> : null}
              </View>
            );
          }
function BreadcrumbPreview({mode}: {readonly mode: string}): React.ReactElement {
  const renderCalendarIcon = () => (
    <Svg height={20} viewBox="0 0 20 20" width={20}>
      <Path
        d="M14.5 3C15.88 3 17 4.12 17 5.5v9c0 1.38-1.12 2.5-2.5 2.5h-9A2.5 2.5 0 013 14.5v-9C3 4.12 4.12 3 5.5 3h9zm0 1h-9C4.67 4 4 4.67 4 5.5v9c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5zM7 11a1 1 0 110 2 1 1 0 010-2zm3 0a1 1 0 110 2 1 1 0 010-2zM7 7a1 1 0 110 2 1 1 0 010-2zm3 0a1 1 0 110 2 1 1 0 010-2zm3 0a1 1 0 110 2 1 1 0 010-2z"
        fill="#424242"
      />
    </Svg>
  );
  const renderItems = (
    items: readonly string[],
    size: 'small' | 'medium' | 'large' = 'medium',
    iconIndexes: readonly number[] = [],
    disabledIndexes: readonly number[] = [],
    tooltips = false,
  ) => (
    <Breadcrumb size={size}>
      {items.map((item, index) => {
        const current = index === items.length - 1;
        return (
          <React.Fragment key={`${item}-${index}`}>
            <BreadcrumbItem>
              <BreadcrumbButton
                current={current}
                disabled={current || disabledIndexes.includes(index)}
                icon={iconIndexes.includes(index) ? renderCalendarIcon() : undefined}
                tooltip={tooltips ? item : undefined}
              >
                {item}
              </BreadcrumbButton>
            </BreadcrumbItem>
            {!current ? <BreadcrumbDivider /> : null}
          </React.Fragment>
        );
      })}
    </Breadcrumb>
  );

  if (includes(mode, 'overflow')) {
    return (
      <BreadcrumbOverflowPreview
        items={['Item 0', 'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6', 'Item 7']}
        maxDisplayedItems={5}
        calendarIcon={renderCalendarIcon()}
        iconIndexes={[1, 5]}
        disabledIndexes={[5]}
      />
    );
  }

  if (includes(mode, 'tooltip')) {
    const longItems = [
      'Item 1',
      'Item 2',
      "Item 3 is long. Don't think about what you want to be, but what you want to do.",
      'Item 4',
      'Item 5 which is longer than 30 characters',
    ];
    return (
      <View style={styles.column}>
        <Text style={styles.heading}>Breadcrumb with a tooltip</Text>
        <BreadcrumbOverflowPreview
          items={['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6', 'Item 7', 'Item 8']}
          maxDisplayedItems={3}
          tooltip
        />
        <Text style={styles.heading}>Breadcrumb with long names</Text>
        {renderItems(longItems, 'medium', [], [], true)}
      </View>
    );
  }

  if (includes(mode, 'size')) {
    return (
      <View style={styles.column}>
        {renderItems(['Item 1', 'Item 2', 'Item 3', 'Item 4'], 'small', [1])}
        {renderItems(['Item 1', 'Item 2', 'Item 3', 'Item 4'], 'medium', [1])}
        {renderItems(['Item 1', 'Item 2', 'Item 3', 'Item 4'], 'large', [1, 3])}
      </View>
    );
  }

  return renderItems(['Item 1', 'Item 2', 'Item 3', 'Item 4'], 'medium', [1]);
}

function BreadcrumbOverflowPreview({
  calendarIcon,
  disabledIndexes = [],
  iconIndexes = [],
  items,
  maxDisplayedItems,
  tooltip = false,
}: {
  readonly calendarIcon?: React.ReactNode;
  readonly disabledIndexes?: readonly number[];
  readonly iconIndexes?: readonly number[];
  readonly items: readonly string[];
  readonly maxDisplayedItems: number;
  readonly tooltip?: boolean;
}): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const partition = partitionBreadcrumbItems({items, maxDisplayedItems});
  const displayedItems = [
    ...partition.startDisplayedItems,
    ...(partition.endDisplayedItems ?? []),
  ];
  const overflowItems = partition.overflowItems ?? [];

  return (
    <View style={styles.breadcrumbOverflowExample}>
      <Breadcrumb>
        {displayedItems.map((item, displayedIndex) => {
          const originalIndex = items.indexOf(item);
          const current = originalIndex === items.length - 1;
          const insertOverflow = displayedIndex === partition.startDisplayedItems.length;
          return (
            <React.Fragment key={item}>
              {insertOverflow ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbButton
                      accessibilityLabel={`${overflowItems.length} more items`}
                      onPress={() => setOpen(value => !value)}
                      tooltip={
                        tooltip
                          ? overflowItems.length > 3
                            ? `${overflowItems.length} items`
                            : overflowItems.join(' > ')
                          : undefined
                      }
                    >
                      <Svg height={20} viewBox="0 0 20 20" width={20}>
                        <Path
                          d="M5.5 10a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                          fill="#424242"
                        />
                      </Svg>
                    </BreadcrumbButton>
                  </BreadcrumbItem>
                  <BreadcrumbDivider />
                </>
              ) : null}
              <BreadcrumbItem>
                <BreadcrumbButton
                  current={current}
                  disabled={current || disabledIndexes.includes(originalIndex)}
                  icon={iconIndexes.includes(originalIndex) ? calendarIcon : undefined}
                >
                  {item}
                </BreadcrumbButton>
              </BreadcrumbItem>
              {!current ? <BreadcrumbDivider /> : null}
            </React.Fragment>
          );
        })}
      </Breadcrumb>
      {open ? (
        <View accessibilityRole="menu" style={styles.breadcrumbOverflowMenu}>
          {overflowItems.map(item => (
            <Pressable
              accessibilityLabel={item}
              accessibilityRole="menuitem"
              key={item}
              onPress={() => setOpen(false)}
              style={({pressed}) => [
                styles.breadcrumbOverflowMenuItem,
                pressed && styles.breadcrumbOverflowMenuItemPressed,
              ]}
            >
              <Text style={styles.breadcrumbOverflowMenuText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ListPreview({component, mode}: FluentCatalogPreviewProps): React.ReactElement {
  const tree = component === 'Tree';
  const menu = component === 'Menu' || component === 'Menu List';
  const nav = component === 'Nav';
  const toolbar = component === 'Toolbar';
  const overflow = component === 'Overflow';
  const [selected, setSelected] = React.useState(0);

  if (toolbar || overflow) {
    return (
      <View style={styles.toolbar}>
        {['New', 'Edit', 'Share', 'Download', 'Delete'].map((item, index) => (
          <Button
            appearance={selected === index ? 'primary' : 'subtle'}
            key={item}
            onClick={() => setSelected(index)}
            size="small"
          >
            {includes(mode, 'icons') ? `★ ${item}` : item}
          </Button>
        ))}
        <Button appearance="subtle" size="small">•••</Button>
      </View>
    );
  }

  const items = nav
    ? ['Home', 'Apps', 'Analytics', 'Settings']
    : menu
      ? ['New file', 'Open', 'Save', 'Share']
      : ['First item', 'Second item', 'Third item'];

  return (
    <View style={[styles.column, nav && styles.navSurface, menu && styles.menuSurface]}>
      {items.map((item, index) => (
        <Pressable
          key={item}
          onPress={() => setSelected(index)}
          style={[styles.listItem, selected === index && styles.selectedItem, menu && styles.menuItem]}
        >
          <Text style={styles.body}>
            {tree ? `${index === 0 ? 'v' : '>'}  ${item}` : `${includes(mode, 'icon', 'visual') ? '★  ' : ''}${item}`}
          </Text>
          {menu && includes(mode, 'submenu') && index === 1 ? <Text style={styles.caption}>›</Text> : null}
        </Pressable>
      ))}
      {tree && includes(mode, 'nested', 'subtree') ? (
        <View style={styles.treeChildren}>
          <Text style={styles.body}>• Child item one</Text>
          <Text style={styles.body}>• Child item two</Text>
        </View>
      ) : null}
    </View>
  );
}

function DialogPreview({mode}: Pick<FluentCatalogPreviewProps, 'mode'>): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);
  const nonModal = includes(mode, 'non modal');
  const alert = includes(mode, 'alert', 'confirmation');
  const fluidActions = includes(mode, 'fluid actions');
  const longContent = includes(mode, 'scrolling');
  const form = includes(mode, 'with form');
  const noFocusableElement = includes(mode, 'no focusable');
  const preventClose = includes(mode, 'no action');
  const controlled = includes(mode, 'controlling');
  const externalTrigger = includes(mode, 'trigger outside');
  const customTrigger = includes(mode, 'custom trigger');
  const titleCustomAction = includes(mode, 'title custom action');
  const motionCustom = includes(mode, 'motion custom');
  const backdropAppearance = includes(mode, 'backdrop') ? 'opaque' : 'dimmed';
  const triggerLabel = nonModal || preventClose
    ? 'Open non-modal dialog'
    : includes(mode, 'alert')
      ? 'Open Alert dialog'
      : includes(mode, 'backdrop')
        ? 'Open Drawer'
        : includes(mode, 'actions') && !fluidActions
          ? 'Open campaign dialog'
          : externalTrigger
            ? 'Open Dialog'
            : customTrigger
              ? 'Custom Trigger'
              : form
                ? 'Open formulary dialog'
                : includes(mode, 'confirmation')
                  ? 'Delete file'
                  : 'Open dialog';

  const actions = noFocusableElement ? undefined : (
    <View style={[styles.row, fluidActions && styles.dialogFluidActions]}>
      <Button
        appearance="secondary"
        onClick={() => setOpen(false)}
        style={fluidActions ? styles.dialogFluidAction : undefined}
      >
        Close
      </Button>
      <Button
        appearance="primary"
        onClick={() => {
          setConfirmed(true);
          setOpen(false);
        }}
        style={fluidActions ? styles.dialogFluidAction : undefined}
      >
        {alert ? 'Confirm' : 'Do something'}
      </Button>
    </View>
  );

  return (
    <View style={styles.column}>
      {motionCustom ? (
        <View style={styles.dialogMotionPanel}>
          {[
            ['Surface duration', '600ms', 180],
            ['Surface outScale', '0.50', 330],
            ['Backdrop duration', '300ms', 204],
          ].map(([label, value, width]) => (
            <View key={label} style={styles.column}>
              <Text style={styles.caption}>{label}: {value}</Text>
              <View style={styles.dialogMotionTrack}>
                <View style={[styles.dialogMotionFill, {width: Number(width)}]} />
              </View>
            </View>
          ))}
        </View>
      ) : null}
      <Button
        appearance={includes(mode, 'backdrop') ? 'primary' : 'secondary'}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>
      {controlled ? <Text style={styles.caption}>Controlled state: {open ? 'open' : 'closed'}</Text> : null}
      {confirmed ? <Text style={styles.caption}>The action was confirmed.</Text> : null}
      <Dialog
        actions={actions}
        backdropAppearance={backdropAppearance}
        modalType={alert ? 'alert' : nonModal ? 'non-modal' : 'modal'}
        onOpenChange={(_event, data) => setOpen(data.open)}
        open={open}
        preventClose={preventClose}
        title={alert ? 'Confirm action' : 'Dialog title'}
        titleAction={titleCustomAction ? <Button appearance="subtle" size="small">Help</Button> : undefined}
      >
        {form ? (
          <View style={styles.column}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              accessibilityLabel="Name"
              placeholder="Enter your name"
              style={styles.input}
            />
          </View>
        ) : (
          <Text style={styles.body}>
            {longContent
              ? 'This dialog contains enough content to demonstrate scrolling. '.repeat(10)
              : noFocusableElement
                ? 'This dialog intentionally has no focusable content.'
                : alert
                  ? 'This action cannot be undone.'
                  : 'This is the dialog body. Use the actions below to continue or close it.'}
          </Text>
        )}
      </Dialog>
    </View>
  );
}

function DividerPreview({mode}: Pick<FluentCatalogPreviewProps, 'mode'>): React.ReactElement {
  if (includes(mode, 'vertical')) {
    return (
      <View style={styles.dividerVerticalStage}>
        <View style={styles.dividerPane} />
        <Divider orientation="vertical">Text</Divider>
        <View style={styles.dividerPane} />
      </View>
    );
  }
  if (includes(mode, 'appearance')) {
    return (
      <View style={styles.column}>
        {(['default', 'subtle', 'brand', 'strong'] as const).map(appearance => (
          <Divider appearance={appearance} key={appearance}>{appearance === 'default' ? '(default)' : appearance}</Divider>
        ))}
      </View>
    );
  }
  if (includes(mode, 'inset')) {
    return (
      <View style={styles.column}>
        <Divider>Default</Divider>
        <Divider inset={48}>Inset 48</Divider>
      </View>
    );
  }
  if (includes(mode, 'align content')) {
    return (
      <View style={styles.column}>
        <Divider alignContent="start">Start</Divider>
        <Divider>Center</Divider>
        <Divider alignContent="end">End</Divider>
      </View>
    );
  }
  if (includes(mode, 'custom styles')) {
    return <Divider appearance="brand" style={styles.dividerCustom}>Custom styled divider</Divider>;
  }
  return (
    <View style={styles.column}>
      <Divider />
      <Divider>Text</Divider>
    </View>
  );
}

function DrawerPreview({mode}: Pick<FluentCatalogPreviewProps, 'mode'>): React.ReactElement {
  const inline = includes(mode, 'inline', 'always open');
  const [open, setOpen] = React.useState(inline);
  const start = includes(mode, 'position');
  const customSize = includes(mode, 'custom size');
  const preventClose = includes(mode, 'prevent close');
  const multipleLevels = includes(mode, 'multiple levels');
  const withNavigation = includes(mode, 'navigation');
  const withScroll = includes(mode, 'scroll');
  const responsive = includes(mode, 'responsive');
  const title = includes(mode, 'with title') ? 'Drawer title' : 'Navigation';

  return (
    <View style={styles.column}>
      {!inline ? <Button onClick={() => setOpen(true)}>Open Drawer</Button> : null}
      <Drawer
        modal={!includes(mode, 'no modal')}
        onOpenChange={(_event, data) => setOpen(data.open)}
        open={open}
        position={start ? 'start' : 'end'}
        preventClose={preventClose}
        separator={includes(mode, 'separator')}
        size={customSize ? 420 : responsive ? 'full' : includes(mode, 'size') ? 'small' : 'medium'}
        title={title}
        type={inline ? 'inline' : 'overlay'}
      >
        {withNavigation ? (
          <View style={styles.column}>
            {['Home', 'People', 'Settings'].map(item => <Button appearance="subtle" key={item}>{item}</Button>)}
          </View>
        ) : (
          <Text style={styles.body}>{withScroll ? 'Scrollable drawer content. '.repeat(18) : 'Drawer content goes here.'}</Text>
        )}
        {multipleLevels ? <View style={styles.drawerNested}><Text style={styles.body}>Second level drawer</Text></View> : null}
        {preventClose ? <Text style={styles.caption}>Close is prevented for this example.</Text> : null}
      </Drawer>
    </View>
  );
}

function DropdownPreview({mode}: Pick<FluentCatalogPreviewProps, 'mode'>): React.ReactElement {
  const controlled = includes(mode, 'controlled');
  const [selected, setSelected] = React.useState<string[]>(controlled ? ['cat'] : []);
  const [open, setOpen] = React.useState(false);
  const options = ['Cat', 'Dog', 'Ferret', 'Fish'];
  const dropdown = (
    <Dropdown
      appearance={includes(mode, 'appearance') ? 'filled-lighter' : 'outline'}
      clearable={includes(mode, 'clearable')}
      disabled={includes(mode, 'disabled')}
      multiselect={includes(mode, 'multiselect')}
      onOpenChange={(_event, data) => setOpen(data.open)}
      onOptionSelect={(_event, data) => setSelected(data.selectedOptions)}
      open={includes(mode, 'controlling open') ? open : undefined}
      placeholder={includes(mode, 'truncated') ? 'Select a very long option value' : 'Select an animal'}
      selectedOptions={controlled ? selected : undefined}
      size={includes(mode, 'size') ? 'large' : 'medium'}
    >
      {options.map((option, index) => (
        <DropdownOption key={option} text={option} value={option.toLowerCase()}>
          {includes(mode, 'complex', 'custom') ? <Text style={styles.body}>★ {option}{index === 0 ? ' — recommended' : ''}</Text> : option}
        </DropdownOption>
      ))}
    </Dropdown>
  );
  return includes(mode, 'with field')
    ? <View style={styles.column}><Text style={styles.label}>Best pet</Text>{dropdown}<Text style={styles.caption}>Choose one option.</Text></View>
    : <View style={styles.column}><Text style={styles.label}>Best pet</Text>{dropdown}{includes(mode, 'active option') ? <Text style={styles.caption}>Active option changes are reported.</Text> : null}</View>;
}

function FieldPreview({mode}: Pick<FluentCatalogPreviewProps, 'mode'>): React.ReactElement {
  const validation = includes(mode, 'validation');
  return (
    <Field
      disabled={includes(mode, 'disabled')}
      hint={includes(mode, 'hint') ? 'This is a helpful hint.' : undefined}
      info={includes(mode, 'info') ? 'Additional information' : undefined}
      label="Example field"
      orientation={includes(mode, 'horizontal') ? 'horizontal' : 'vertical'}
      required={includes(mode, 'required')}
      size={includes(mode, 'size') ? 'large' : 'medium'}
      validationMessage={validation ? 'This field has an error.' : undefined}
      validationState={validation ? 'error' : 'none'}
    >
      <Input disabled={includes(mode, 'disabled')} placeholder="Enter text" />
    </Field>
  );
}

function ImagePreview({mode}: Pick<FluentCatalogPreviewProps, 'mode'>): React.ReactElement {
  if (includes(mode, 'shape')) {
    return <View style={styles.row}>{(['square', 'rounded', 'circular'] as const).map((shape, index) => <FluentImage key={shape} shape={shape} source={{uri: carouselImages[index]}} style={styles.imageSmall} />)}</View>;
  }
  return <FluentImage accessibilityLabel="Fluent UI example" bordered={includes(mode, 'bordered')} block={includes(mode, 'block')} fit={includes(mode, 'fit') ? 'contain' : 'cover'} shadow={includes(mode, 'shadow')} source={{uri: includes(mode, 'fallback') ? 'invalid://image' : carouselImages[0]}} />;
}

function InfoLabelPreview({mode}: Pick<FluentCatalogPreviewProps, 'mode'>): React.ReactElement {
  const info = <InfoLabel info="Helpful information about this field." required={includes(mode, 'required')} size={includes(mode, 'size') ? 'large' : 'medium'}>Example label</InfoLabel>;
  return includes(mode, 'in field') ? <Field label={info}><Input placeholder="Enter text" /></Field> : info;
}

function InputPreview({mode}: Pick<FluentCatalogPreviewProps, 'mode'>): React.ReactElement {
  const [value, setValue] = React.useState(includes(mode, 'controlled') ? 'Controlled value' : '');
  return <Input appearance={includes(mode, 'appearance') ? 'filled-lighter' : 'outline'} contentAfter={includes(mode, 'content before after') ? <Text>kg</Text> : undefined} contentBefore={includes(mode, 'content before after') ? <Text>★</Text> : undefined} disabled={includes(mode, 'disabled')} inline={includes(mode, 'inline')} onChangeText={includes(mode, 'controlled') ? setValue : undefined} placeholder={includes(mode, 'placeholder') ? 'This is a placeholder' : 'Enter text'} secureTextEntry={includes(mode, 'type')} size={includes(mode, 'size') ? 'large' : 'medium'} value={includes(mode, 'controlled') ? value : undefined} />;
}

function LabelPreview({mode}: Pick<FluentCatalogPreviewProps, 'mode'>): React.ReactElement {
  return <Label disabled={includes(mode, 'disabled')} required={includes(mode, 'required')} size={includes(mode, 'size') ? 'large' : 'medium'} weight={includes(mode, 'weight') ? 'regular' : 'semibold'}>Example label</Label>;
}

function LinkPreview({mode}: Pick<FluentCatalogPreviewProps, 'mode'>): React.ReactElement {
  const [activated, setActivated] = React.useState(false);
  return <View style={styles.column}><Link appearance={includes(mode, 'appearance') ? 'subtle' : 'default'} disabled={includes(mode, 'disabled')} disabledFocusable={includes(mode, 'disabled focusable')} inline={includes(mode, 'inline')} onPress={() => setActivated(true)}>{includes(mode, 'as button') ? 'Link styled as a button' : includes(mode, 'as span') ? 'Link styled as text' : 'Fluent UI link'}</Link>{activated ? <Text style={styles.caption}>Link activated.</Text> : null}</View>;
}

function NativeListPreview({mode}: Pick<FluentCatalogPreviewProps, 'mode'>): React.ReactElement {
  const controlled = includes(mode, 'controlled');
  const [selected, setSelected] = React.useState<string[]>([]);
  const actionable = includes(mode, 'action');
  return (
    <List multiselect={includes(mode, 'multiple actions')} onSelectionChange={setSelected} selectedItems={controlled ? selected : undefined}>
      {['One', 'Two', 'Three', 'Four'].map((item, index) => (
        <ListItem action={actionable ? <Button appearance="subtle" size="small">Open</Button> : undefined} id={item} key={item} secondaryAction={includes(mode, 'multiple actions') ? <Button appearance="subtle" size="small">•••</Button> : undefined}>
          <View><Text style={styles.body}>{item}</Text><Text style={styles.caption}>List item {index + 1}</Text></View>
        </ListItem>
      ))}
    </List>
  );
}

function OverlayPreview({component, mode}: FluentCatalogPreviewProps): React.ReactElement {
  const drawer = component === 'Drawer';
  const tooltip = component === 'Tooltip';
  const toast = component === 'Toast';
  const [open, setOpen] = React.useState(includes(mode, 'open', 'inline'));

  if (!open) {
    return <Button onClick={() => setOpen(true)}>Open {component}</Button>;
  }

  if (tooltip) {
    return (
      <View style={styles.tooltipStage}>
        <Button onClick={() => setOpen(false)}>Hover target</Button>
        <View style={styles.tooltipBubble}><Text style={styles.tooltipText}>Helpful tooltip text</Text></View>
      </View>
    );
  }

  return (
    <View style={[styles.overlayStage, drawer && styles.drawerStage, toast && styles.toastStage]}>
      <View style={[styles.overlaySurface, drawer && styles.drawerSurface, toast && styles.toastSurface]}>
        <Text style={styles.heading}>{toast ? 'Upload complete' : `${component} title`}</Text>
        <Text style={styles.body}>
          {includes(mode, 'scroll') ? 'Scrollable content '.repeat(12) : `${mode} content rendered in a native surface.`}
        </Text>
        <View style={styles.row}>
          <Button appearance="primary" size="small">Confirm</Button>
          <Button appearance="subtle" onClick={() => setOpen(false)} size="small">Close</Button>
        </View>
      </View>
    </View>
  );
}

function PortalPreview({component, mode}: FluentCatalogPreviewProps): React.ReactElement {
  const mountNode = component === 'to Mount Node Props';
  return (
    <View style={styles.portalStage}>
      <View style={styles.portalSource}>
        <Text style={styles.caption}>{mountNode ? 'Custom mount node' : 'Portal source'}</Text>
      </View>
      <View style={styles.portalTarget}>
        <Text style={styles.heading}>Portaled content</Text>
        <Text style={styles.body}>
          {mountNode ? 'Rendered inside the selected mount node.' : `${mode} content rendered outside its source hierarchy.`}
        </Text>
      </View>
    </View>
  );
}

const carouselImages = [
  'https://fabricweb.azureedge.net/fabric-website/assets/images/swatch-picker/sea-full-img.jpg',
  'https://fabricweb.azureedge.net/fabric-website/assets/images/swatch-picker/bridge-full-img.jpg',
  'https://fabricweb.azureedge.net/fabric-website/assets/images/swatch-picker/park-full-img.jpg',
];
const carouselPreviewImages = [
  'https://fabricweb.azureedge.net/fabric-website/assets/images/swatch-picker/sea-swatch.jpg',
  'https://fabricweb.azureedge.net/fabric-website/assets/images/swatch-picker/bridge-swatch.jpg',
  'https://fabricweb.azureedge.net/fabric-website/assets/images/swatch-picker/park-swatch.jpg',
];

function CarouselPreview({component, mode}: FluentCatalogPreviewProps): React.ReactElement {
  const navOnly = component === 'Carousel Nav';
  const firstRun = includes(mode, 'first run');
  const controlled = includes(mode, 'controlled');
  const imageSlideshow = includes(mode, 'image slideshow');
  const responsive = includes(mode, 'responsive', 'eventing');
  const eventingStory = includes(mode, 'eventing');
  const topNavigation = includes(mode, 'top navigation');
  const autoplayStory = includes(mode, 'autoplay');
  const [activeIndex, setActiveIndex] = React.useState(controlled ? 1 : 0);
  const [autoplayEnabled, setAutoplayEnabled] = React.useState(false);
  const [autoplayPresent, setAutoplayPresent] = React.useState(true);
  const [autoplayInterval, setAutoplayInterval] = React.useState(4000);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [imageButtons, setImageButtons] = React.useState(false);
  const [alignment, setAlignment] = React.useState<'start' | 'center' | 'end'>('center');
  const [whitespace, setWhitespace] = React.useState(false);
  const [lastEvent, setLastEvent] = React.useState('No events yet');
  const count = firstRun ? 2 : imageSlideshow ? 3 : controlled ? 5 : responsive ? 7 : navOnly ? 5 : 6;

  if (navOnly) {
    return (
      <View style={styles.column}>
        <View style={styles.carouselControlRow}>
          <Text style={styles.body}>Use CarouselNavImageButton</Text>
          <NativeSwitch onValueChange={setImageButtons} value={imageButtons} />
        </View>
        <Carousel
          indicatorImages={imageButtons ? Array.from({length: count}, (_, index) => ({uri: carouselImages[index % carouselImages.length]})) : undefined}
          showControls={false}
          slideStyle={styles.carouselNavStage}
        >
          {Array.from({length: count}, (_, index) => <Text key={index} style={styles.caption}>Navigation target {index + 1}</Text>)}
        </Carousel>
      </View>
    );
  }

  if (firstRun && !dialogOpen) {
    return <Button onClick={() => { setActiveIndex(0); setDialogOpen(true); }}>Open Dialog</Button>;
  }

  const alignmentStory = includes(mode, 'alignment', 'whitespace');
  const externallyControlled = controlled || firstRun || eventingStory || topNavigation;
  const slideCount = alignmentStory ? 3 : count;
  const indicatorImages = imageSlideshow
    ? carouselPreviewImages.map(uri => ({uri}))
    : undefined;

  const slides = Array.from({length: slideCount}, (_, index) => {
    if (responsive || controlled) {
      const sizes = [undefined, 'small', 'medium', 'large', 'medium', 'large', 'small'] as const;
      const size = controlled ? undefined : sizes[index];
      return (
        <View
          key={index}
          style={[
            styles.carouselWireframe,
            index % 2 === 1 && styles.carouselWireframeBrand,
            size === 'small' && styles.carouselWireframeSmall,
            size === 'medium' && styles.carouselWireframeMedium,
            size === 'large' && styles.carouselWireframeLarge,
          ]}
        >
          <Text style={styles.carouselWireframeInfo}>
            {controlled ? `index: ${index}` : `size: ${size ?? 'auto'}`}
          </Text>
          <Text style={styles.heading}>Lorem Ipsum</Text>
          <Text style={styles.body}>
            {size === 'small'
              ? 'Lorem ipsum...'
              : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'}
          </Text>
        </View>
      );
    }
    if (alignmentStory) {
      return (
        <View key={index} style={styles.carouselActionCard}>
          <Image
            source={{uri: 'https://fabricweb.azureedge.net/fabric-website/assets/images/wireframe/image-square.png'}}
            style={styles.carouselActionCardImage}
          />
          <View style={styles.carouselActionCardInfo}>
            <Avatar name={['Allan Munger', 'Amanda Brady', 'Ashley McCarthy'][index]} size={32} />
            <View style={styles.carouselActionCardText}>
              <Text style={styles.heading}>{['Meeting notes', 'FY24 Hiring Budget', 'Test edited this'][index]}</Text>
              <Text style={styles.caption}>{['2 days ago by Kathryn Murphy', 'Wed at 3:38pm', 'Thu at 4:38pm'][index]}</Text>
            </View>
            <Text style={styles.carouselMoreIcon}>•••</Text>
          </View>
        </View>
      );
    }
    return (
      <View
        style={[
          firstRun ? styles.carouselFirstRunCard : styles.carouselHero,
          imageSlideshow && styles.carouselImageSlideshow,
        ]}
        key={index}
      >
        <Image
          source={{uri: carouselImages[index % carouselImages.length]}}
          style={firstRun ? styles.carouselFirstRunImage : styles.carouselHeroImage}
        />
        {!imageSlideshow ? (
          <View style={firstRun ? styles.carouselFirstRunContent : styles.carouselHeroOverlay}>
            <Text style={styles.carouselTitle}>
              {firstRun
                ? index === 0
                  ? 'Discover Copilot, a whole new way to work'
                  : 'Use your own judgment'
                : `Card ${index + 1}`}
            </Text>
            <Text style={styles.body}>
              {firstRun
                ? index === 0
                  ? 'Explore new ways to work smarter and faster using the power of AI. Copilot in [Word] can help you [get started from scratch], [work from an existing file], [get actionable insights about documents], and more.'
                  : 'Copilot can make mistakes so remember to verify the results. To help improve the experience, please share your feedback with us.'
                : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.'}
            </Text>
            {!firstRun ? <Button size="small">Call to action</Button> : null}
          </View>
        ) : null}
      </View>
    );
  });

  return (
    <View style={[styles.carouselRoot, firstRun && styles.carouselDialog]}>
      {topNavigation ? (
        <View style={styles.carouselHeader}>
          <Text style={styles.carouselHeaderTitle}>Carousel Title</Text>
          <View style={styles.carouselTopNavigation}>
            <Button
              appearance="subtle"
              onClick={() => setActiveIndex(index => (index - 1 + count) % count)}
              size="small"
            >
              ‹
            </Button>
            <View style={styles.carouselTopNavigationDots}>
              {Array.from({length: count}, (_, index) => (
                <Pressable
                  accessibilityLabel={`Go to slide ${index + 1}`}
                  accessibilityRole="button"
                  key={index}
                  onPress={() => setActiveIndex(index)}
                  style={styles.carouselTopNavigationDotTarget}
                >
                  <View
                    style={[
                      styles.carouselTopNavigationDot,
                      index === activeIndex && styles.carouselTopNavigationDotSelected,
                    ]}
                  />
                </Pressable>
              ))}
            </View>
            <Button
              appearance="subtle"
              onClick={() => setActiveIndex(index => (index + 1) % count)}
              size="small"
            >
              ›
            </Button>
          </View>
        </View>
      ) : null}
      {alignmentStory ? (
        <View style={styles.carouselControlsPanel}>
          <View style={styles.carouselFieldRow}>
            <Text style={styles.body}>Alignment</Text>
            <View style={styles.carouselControlRow}>
              {(['start', 'center', 'end'] as const).map(value => (
                <Button
                  appearance={alignment === value ? 'primary' : 'secondary'}
                  key={value}
                  onClick={() => setAlignment(value)}
                  size="small"
                >
                  {value}
                </Button>
              ))}
            </View>
          </View>
          <View style={styles.carouselFieldRow}>
            <Text style={styles.body}>Whitespace</Text>
            <NativeSwitch onValueChange={setWhitespace} value={whitespace} />
          </View>
        </View>
      ) : null}
      {autoplayStory ? (
        <View style={styles.carouselControlsPanel}>
          <View style={styles.carouselFieldRow}>
            <Text style={styles.body}>Autoplay Present</Text>
            <NativeSwitch onValueChange={setAutoplayPresent} value={autoplayPresent} />
          </View>
          <View style={styles.carouselFieldRow}>
            <Text style={styles.body}>Autoplay Enabled</Text>
            <NativeSwitch onValueChange={setAutoplayEnabled} value={autoplayEnabled} />
          </View>
          <View style={styles.carouselFieldRow}>
            <View>
              <Text style={styles.body}>Autoplay Interval (ms)</Text>
              <Text style={styles.caption}>Delay between slides: {autoplayInterval}ms</Text>
            </View>
            <TextInput
              keyboardType="numeric"
              onChangeText={value => {
                const nextValue = Number.parseInt(value, 10);
                if (Number.isFinite(nextValue) && nextValue >= 1000) {
                  setAutoplayInterval(nextValue);
                }
              }}
              style={styles.carouselIntervalInput}
              value={String(autoplayInterval)}
            />
          </View>
        </View>
      ) : null}
      <Carousel
        activeIndex={externallyControlled ? activeIndex : undefined}
        align={alignment}
        appearance={includes(mode, 'appearance') ? 'elevated' : 'flat'}
        autoplay={autoplayStory && autoplayPresent && autoplayEnabled}
        autoplayInterval={autoplayInterval}
        circular={!responsive && !controlled && !imageSlideshow && !alignmentStory}
        draggable={responsive || controlled || topNavigation}
        gap={responsive || alignmentStory ? 10 : 0}
        indicatorImages={indicatorImages}
        motion={imageSlideshow || firstRun ? 'fade' : 'slide'}
        onActiveIndexChange={(_, data) => {
          if (externallyControlled) {
            setActiveIndex(data.index);
          }
          if (eventingStory) {
            setLastEvent(`Event: ${data.type}, index: ${data.index}`);
          }
        }}
        showAutoplayButton={autoplayPresent && !topNavigation && !imageSlideshow && !firstRun}
        showControls={!firstRun && !topNavigation}
        showIndicators={!topNavigation && !controlled && !firstRun}
        slideStyle={imageSlideshow ? styles.carouselImageSlideshow : undefined}
        slideWidth={responsive ? 350 : alignmentStory ? 350 : undefined}
      >
        {slides}
      </Carousel>
      {controlled ? (
        <View style={styles.carouselControlRow}>
          <Text style={styles.body}>activeIndex: {activeIndex}</Text>
          {Array.from({length: count}, (_, index) => (
            <Button disabled={index === activeIndex} key={index} onClick={() => setActiveIndex(index)} size="small">{String(index)}</Button>
          ))}
        </View>
      ) : null}
      {eventingStory ? (
        <View style={styles.carouselEventLog}>
          <Text style={styles.carouselEventLogLabel}>Events log</Text>
          <Text style={styles.body}>{lastEvent}</Text>
        </View>
      ) : null}
      {firstRun ? (
        <View style={styles.carouselFirstRunFooter}>
          <Button
            appearance="subtle"
            onClick={() => activeIndex === 0 ? setDialogOpen(false) : setActiveIndex(activeIndex - 1)}
          >
            {activeIndex === 0 ? 'Not Now' : 'Previous'}
          </Button>
          <View style={styles.carouselTopNavigationDots}>
            {Array.from({length: count}, (_, index) => (
              <View key={index} style={styles.carouselTopNavigationDotTarget}>
                <View
                  style={[
                    styles.carouselTopNavigationDot,
                    index === activeIndex && styles.carouselTopNavigationDotSelected,
                  ]}
                />
              </View>
            ))}
          </View>
          <Button onClick={() => activeIndex === count - 1 ? setDialogOpen(false) : setActiveIndex(activeIndex + 1)}>
            {activeIndex === count - 1 ? 'Try Copilot' : 'Next'}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

function ProgressPreview({component, mode}: FluentCatalogPreviewProps): React.ReactElement {
  const [rating, setRating] = React.useState(includes(mode, 'half') ? 3.5 : 4);

  if (component === 'Spinner') {
    if (includes(mode, 'size')) {
      return (
        <View style={styles.column}>
          {['Tiny', 'Extra small', 'Small', 'Medium', 'Large', 'Extra large', 'Huge'].map((label, index) => (
            <View key={label} style={styles.spinnerRow}>
              <ActivityIndicator color="#0f6cbd" size={index > 3 ? 'large' : 'small'} />
              <Text style={styles.body}>{label}</Text>
            </View>
          ))}
        </View>
      );
    }
    return (
      <View style={styles.spinnerRow}>
        <ActivityIndicator color={includes(mode, 'inverted') ? '#ffffff' : '#0f6cbd'} size={includes(mode, 'large') ? 'large' : 'small'} />
        {includes(mode, 'label') ? <Text style={styles.body}>Loading...</Text> : null}
      </View>
    );
  }

  if (component.includes('Rating')) {
    return (
      <View style={styles.ratingRow}>
        {Array.from({length: 5}, (_, index) => (
          <Pressable disabled={component === 'Rating Display'} key={index} onPress={() => setRating(index + 1)}>
            <Text style={[styles.ratingStar, index >= Math.ceil(rating) && styles.ratingStarEmpty]}>★</Text>
          </Pressable>
        ))}
        {includes(mode, 'value', 'display') || component === 'Rating Display' ? <Text style={styles.body}>{rating.toFixed(1)}</Text> : null}
      </View>
    );
  }

  if (component === 'Slider') {
    const vertical = includes(mode, 'vertical');
    return (
      <View style={[styles.progressTrack, vertical && styles.progressTrackVertical]}>
        <View style={[styles.progressFill, vertical ? styles.progressFillVertical : {width: '60%'}]} />
        <View style={[styles.sliderThumb, vertical && styles.sliderThumbVertical]} />
      </View>
    );
  }

  return (
    <View style={styles.column}>
      {includes(mode, 'label') ? <View style={styles.progressLabel}><Text style={styles.body}>Downloading</Text><Text style={styles.caption}>70%</Text></View> : null}
      <View style={[styles.progressTrack, includes(mode, 'error') && styles.progressTrackError]}>
        <View style={[styles.progressFill, {width: includes(mode, 'indeterminate') ? '35%' : '70%'}]} />
      </View>
      {includes(mode, 'validation') ? <Text style={styles.errorText}>There was a problem completing this action.</Text> : null}
    </View>
  );
}

function SkeletonPreview({mode}: {readonly mode: string}): React.ReactElement {
  if (includes(mode, 'rows')) {
    return (
      <View style={styles.column}>
        {Array.from({length: 8}, (_, index) => <View key={index} style={[styles.skeleton, {width: `${95 - index * 4}%`}]} />)}
      </View>
    );
  }

  return (
    <View style={[styles.column, includes(mode, 'card') && styles.skeletonCard]}>
      {includes(mode, 'avatar') ? <View style={styles.skeletonAvatar} /> : null}
      <View style={[styles.skeleton, {width: '45%'}]} />
      <View style={[styles.skeleton, {width: '100%'}]} />
      <View style={[styles.skeleton, {width: '78%'}]} />
    </View>
  );
}

function TagPreview({component, mode}: FluentCatalogPreviewProps): React.ReactElement {
  const picker = component === 'Tag Picker';
  const group = component === 'Tag Group';
  const [tags, setTags] = React.useState(['Design', 'Engineering', 'Research']);

  if (picker) {
    return (
      <View style={styles.tagPicker}>
        <View style={styles.row}>
          {tags.map(tag => <Pill key={tag}>{tag}</Pill>)}
          <TextInput placeholder="Add a tag" style={styles.tagInput} />
        </View>
        <View style={styles.choicePopup}>
          {['Marketing', 'Finance', 'Operations'].map(option => (
            <Pressable key={option} onPress={() => setTags(current => [...current, option])} style={styles.choiceOption}>
              <Text style={styles.body}>{option}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, group && includes(mode, 'vertical') && styles.tagGroupVertical]}>
      {tags.map((tag, index) => (
        <Pressable
          key={tag}
          onPress={() => includes(mode, 'dismiss') && setTags(current => current.filter(value => value !== tag))}
          style={[
            styles.tag,
            includes(mode, 'appearance') && index === 0 && styles.tagPrimary,
            includes(mode, 'shape') && index === 1 && styles.tagCircular,
          ]}
        >
          {includes(mode, 'icon', 'media') ? <Text style={styles.tagIcon}>★</Text> : null}
          <Text style={[styles.body, index === 0 && includes(mode, 'appearance') && styles.tagPrimaryText]}>{tag}</Text>
          {includes(mode, 'dismiss') ? <Text style={styles.caption}>×</Text> : null}
        </Pressable>
      ))}
    </View>
  );
}

function TextPreview({component, mode}: FluentCatalogPreviewProps): React.ReactElement {
  if (component === 'Link') {
    return <LinkV1 disabled={includes(mode, 'disabled')}>Fluent UI link</LinkV1>;
  }

  if (component === 'Persona') {
    return <Persona initials="AL" presence="online" secondaryText={mode} size="size56" text="Ada Lovelace" />;
  }

  if (component === 'Image') {
    if (includes(mode, 'fit', 'shape', 'size')) {
      return (
        <View style={styles.row}>
          {[80, 120, 160].map((size, index) => (
            <Image
              key={size}
              source={{uri: carouselImages[index]}}
              style={[styles.image, {borderRadius: includes(mode, 'shape') ? size / 2 : 4, height: size, width: size}]}
            />
          ))}
        </View>
      );
    }
    return (
      <Image
        accessibilityLabel="Fluent UI placeholder"
        source={{uri: carouselImages[0]}}
        style={styles.image}
      />
    );
  }

  if (component === 'Info Label') {
    return <View style={styles.infoLabel}><Text style={styles.body}>{includes(mode, 'required') ? 'Required label *' : 'Info label'}</Text><Text style={styles.infoIcon}>i</Text></View>;
  }

  if (component === 'Label') {
    return <Text style={[styles.label, includes(mode, 'disabled') && styles.disabledText]}>{includes(mode, 'required') ? 'Required label *' : 'Example label'}</Text>;
  }

  if (component === 'Text' && includes(mode, 'size')) {
    return (
      <View style={styles.column}>
        {[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((size, index) => (
          <Text key={size} style={{fontSize: 10 + index * 2, fontWeight: index > 5 ? '700' : '400'}}>{size} Text sample</Text>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.column}>
      <TextV1 size={500} weight="semibold">{component}</TextV1>
      <TextV1 italic={includes(mode, 'italic')} underline={includes(mode, 'underline')}>{mode} example text</TextV1>
    </View>
  );
}

function GenericPreview({component, mode}: FluentCatalogPreviewProps): React.ReactElement {
  if (component === 'Fluent Provider') {
    return (
      <View style={styles.providerStack}>
        <View style={styles.providerLight}><Text style={styles.body}>Light theme provider</Text><Button size="small">Button</Button></View>
        <View style={styles.providerDark}><Text style={styles.providerDarkText}>Dark theme provider</Text><Button size="small">Button</Button></View>
      </View>
    );
  }

  return (
    <Surface>
      <Text style={styles.heading}>{component}</Text>
      <Text style={styles.body}>{mode}</Text>
      <View style={styles.row}><Button size="small">Primary action</Button><Button appearance="subtle" size="small">Secondary</Button></View>
    </Surface>
  );
}

export function FluentCatalogPreview({component, mode}: FluentCatalogPreviewProps): React.ReactElement {
  const componentName = component.split(' / ').at(-1) ?? component;
  const previewProps = {component: componentName, mode};

  if (componentName === 'Accordion') return <AccordionPreview mode={mode} />;
  if (componentName.startsWith('Avatar')) return <AvatarPreview {...previewProps} />;
  if (componentName.includes('Badge')) return <BadgePreview {...previewProps} />;
  if (componentName.includes('Button')) return <ButtonPreview {...previewProps} />;
  if (componentName.startsWith('Card')) return <CardPreview {...previewProps} />;
  if (componentName === 'Checkbox') return <CheckboxPreview mode={mode} />;
  if (componentName === 'Combobox') {
    return <ComboboxPreview mode={mode} />;
  }
  if (['Radio Group', 'Switch', 'Tab List'].includes(componentName)) return <SelectionPreview {...previewProps} />;
  if (['Color Picker', 'Swatch Picker'].includes(componentName)) return <ColorPreview mode={mode} />;
  if (componentName === 'Dropdown') return <DropdownPreview mode={mode} />;
  if (componentName === 'Field') return <FieldPreview mode={mode} />;
  if (componentName === 'Input') return <InputPreview mode={mode} />;
  if (['Search Box', 'Select', 'Spin Button', 'Textarea'].includes(componentName)) {
    return <ChoiceInputPreview {...previewProps} />;
  }
  if (componentName === 'Data Grid') return <DataGridPreview mode={mode} />;
  if (componentName === 'Table') return <DataPreview {...previewProps} />;
  if (componentName === 'Dialog') return <DialogPreview mode={mode} />;
  if (componentName === 'Drawer') return <DrawerPreview mode={mode} />;
  if (['Popover', 'Teaching Popover', 'Toast', 'Tooltip'].includes(componentName)) {
    return <OverlayPreview {...previewProps} />;
  }
  if (['Progress Bar', 'Rating', 'Rating Display', 'Slider', 'Spinner'].includes(componentName)) {
    return <ProgressPreview {...previewProps} />;
  }
  if (componentName === 'Skeleton') return <SkeletonPreview mode={mode} />;
  if (['Interaction Tag', 'Tag', 'Tag Group', 'Tag Picker'].includes(componentName)) return <TagPreview {...previewProps} />;
  if (componentName === 'Breadcrumb') return <BreadcrumbPreview mode={mode} />;
  if (componentName === 'List') return <NativeListPreview mode={mode} />;
  if (['Menu', 'Menu List', 'Nav', 'Overflow', 'Toolbar', 'Tree'].includes(componentName)) {
    return <ListPreview {...previewProps} />;
  }
  if (componentName === 'Image') return <ImagePreview mode={mode} />;
  if (componentName === 'Info Label') return <InfoLabelPreview mode={mode} />;
  if (componentName === 'Label') return <LabelPreview mode={mode} />;
  if (componentName === 'Link') return <LinkPreview mode={mode} />;
  if (['Persona', 'Text'].includes(componentName)) {
    return <TextPreview {...previewProps} />;
  }
  if (componentName === 'Divider') return <DividerPreview mode={mode} />;
  if (componentName === 'Message Bar') return <View style={styles.messageBar}><Text style={styles.body}>Informational message</Text></View>;
  if (componentName === 'Portal' || componentName === 'to Mount Node Props') return <PortalPreview {...previewProps} />;
  if (componentName === 'Carousel' || componentName === 'Carousel Nav') return <CarouselPreview {...previewProps} />;

  return <GenericPreview {...previewProps} />;
}

const styles = StyleSheet.create({
  accordionHeader: {alignItems: 'center', flexDirection: 'row', gap: 10, minHeight: 40},
  accordionHeaderLarge: {minHeight: 52},
  accordionHeaderSmall: {minHeight: 32},
  accordionInline: {borderBottomWidth: 0},
  accordionItem: {borderBottomColor: '#e0e0e0', borderBottomWidth: 1},
  accordionLeadingIcon: {color: '#0f6cbd', fontSize: 16},
  accordionMotionControls: {alignSelf: 'stretch', borderColor: '#616161', borderRadius: 4, borderWidth: 2, gap: 8, padding: 10, width: '100%'},
  accordionMotionSwitch: {minWidth: 0},
  accordionMotionSwitchLabel: {flexShrink: 1},
  accordionPanel: {color: '#424242', paddingBottom: 12, paddingLeft: 26},
  accordionPanelSolid: {opacity: 1},
  accordionPersonaList: {gap: 8, paddingVertical: 8},
  accordionSlider: {backgroundColor: '#929292', height: 2, marginVertical: 8, width: '100%'},
  accordionSliderFill: {backgroundColor: '#0f6cbd', height: 2},
  accordionSliderThumb: {backgroundColor: '#ffffff', borderColor: '#0f6cbd', borderRadius: 8, borderWidth: 4, height: 16, marginLeft: -8, position: 'absolute', top: -7, width: 16},
  avatar: {alignItems: 'center', borderColor: '#ffffff', borderRadius: 24, borderWidth: 2, height: 48, justifyContent: 'center', width: 48},
  avatar128: {alignItems: 'center', backgroundColor: '#e0e0e0', borderRadius: 64, height: 128, justifyContent: 'center', width: 128},
  avatar128Text: {color: '#616161', fontFamily: 'Segoe UI', fontSize: 40, fontWeight: '600'},
  avatarActiveRow: {alignItems: 'center', flexDirection: 'row', gap: 20},
  avatarActive: {borderColor: '#0f6cbd', borderWidth: 4},
  avatarGroupColumn: {alignItems: 'flex-start', gap: 10, width: '100%'},
  avatarGroupIndicator128: {marginLeft: 4},
  avatarGroupRow: {alignItems: 'center', flexDirection: 'row', flexWrap: 'nowrap'},
  avatarGroupVertical: {alignItems: 'flex-start', flexDirection: 'column'},
  avatarImage: {borderRadius: 999, height: '100%', width: '100%'},
  avatarLarge: {borderRadius: 36, height: 72, width: 72},
  avatarOverlap: {marginLeft: -12},
  avatarPie: {borderBottomColor: '#f7630c', borderLeftColor: '#107c10', borderRightColor: '#0f6cbd', borderTopColor: '#8764b8'},
  avatarSmall: {borderRadius: 16, height: 32, width: 32},
  avatarShadow: {borderRadius: 24, elevation: 6, shadowColor: '#000000', shadowOffset: {height: 2, width: 0}, shadowOpacity: 0.24, shadowRadius: 4},
  avatarStoryRow: {alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  avatarGlyph: {fontFamily: 'Segoe Fluent Icons', fontSize: 16, textAlign: 'center'},
  webAvatar: {alignItems: 'center', justifyContent: 'center'},
  webAvatarBadge: {alignItems: 'center', bottom: -1, justifyContent: 'center', position: 'absolute', right: -1},
  webAvatarBadgeIcon: {color: '#ffffff', fontFamily: 'Segoe Fluent Icons', fontSize: 8},
  webAvatarImage: {borderRadius: 999, height: '100%', width: '100%'},
  webAvatarText: {fontWeight: '600', textAlign: 'center'},
  avatarText: {color: '#ffffff', fontWeight: '600'},
  avatarTextNeutral: {color: '#616161'},
  badge: {backgroundColor: '#0f6cbd', borderColor: '#0f6cbd', borderRadius: 12, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3},
  badgeGhost: {backgroundColor: 'transparent', borderColor: 'transparent'},
  badgeOutline: {backgroundColor: 'transparent'},
  badgeSquare: {borderRadius: 3},
  badgeText: {color: '#ffffff', fontSize: 12, fontWeight: '600'},
  badgeIcon: {color: '#ffffff', fontSize: 10},
  badgeAppearanceColumn: {alignItems: 'flex-start', gap: 12},
  badgeAppearanceHeading: {color: '#242424', fontFamily: 'Segoe UI', fontSize: 16, fontWeight: '600'},
  badgeAppearanceSection: {alignItems: 'flex-start', gap: 8},
  badgeBrandBackground: {backgroundColor: '#0f6cbd', padding: 4},
  badgeTint: {backgroundColor: '#ebf3fc'},
  body: {color: '#242424', fontFamily: 'Segoe UI', fontSize: 14},
  buttonMenuContainer: {alignItems: 'flex-start', position: 'relative', zIndex: 1},
  buttonMenuItem: {alignSelf: 'stretch', justifyContent: 'flex-start', minHeight: 32, paddingHorizontal: 12},
  buttonMenuPopup: {backgroundColor: '#ffffff', borderColor: '#d1d1d1', borderRadius: 4, borderWidth: 1, elevation: 4, minWidth: 180, paddingVertical: 4, zIndex: 10},
  compactAppearanceButton: {minWidth: 76, paddingHorizontal: 4},
  compactButtonRow: {gap: 4},
  compactCompoundAppearance: {paddingHorizontal: 4, width: 132},
  longTextButton: {maxWidth: 280},
  splitIconPrimary: {maxWidth: 170},
  breadcrumb: {alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%'},
  breadcrumbSeparator: {color: '#707070', fontSize: 16},
  breadcrumbText: {color: '#0f6cbd', fontFamily: 'Segoe UI', fontSize: 14},
  breadcrumbTextLarge: {fontSize: 18},
  caption: {color: '#616161', fontFamily: 'Segoe UI', fontSize: 12},
  cardHeader: {alignItems: 'center', flexDirection: 'row', gap: 10},
  card: {backgroundColor: '#ffffff', borderColor: '#d1d1d1', borderRadius: 8, borderWidth: 1, gap: 12, maxWidth: 420, minWidth: 280, overflow: 'hidden', padding: 14},
  cardFooter: {alignItems: 'center', flexDirection: 'row', gap: 8},
  cardHeaderAction: {color: '#616161', paddingLeft: 12},
  cardImage: {height: '100%', resizeMode: 'cover', width: '100%'},
  cardLogo: {backgroundColor: '#ffffffdd', bottom: 8, color: '#0f6cbd', fontWeight: '700', left: 8, padding: 4, position: 'absolute'},
  cardPreview: {alignItems: 'center', backgroundColor: '#f5f5f5', height: 92, justifyContent: 'center'},
  cardPreviewWide: {height: 130},
  cardSelectionIndicator: {color: '#0f6cbd', fontSize: 20, fontWeight: '700'},
  cardSelected: {borderColor: '#0f6cbd', borderWidth: 3},
  cardStoryColumn: {alignItems: 'flex-start', gap: 12, width: '100%'},
  cardActionExample: {maxWidth: 320, width: '100%'},
  cardActionPreview: {aspectRatio: 2.06},
  cardAppearanceExample: {maxWidth: 384, width: '100%'},
  cardAppLogo: {borderRadius: 4, height: 48, width: 48},
  cardAppMark: {alignItems: 'center', backgroundColor: '#242424', height: '100%', justifyContent: 'center', width: '100%'},
  cardAppMarkText: {color: '#ffffff', fontFamily: 'Segoe UI', fontSize: 17, fontStyle: 'italic', fontWeight: '700'},
  cardAvatar: {borderRadius: 16, height: 32, width: 32},
  cardAutomationLogo: {alignItems: 'center', borderRadius: 4, height: '100%', justifyContent: 'center', width: '100%'},
  cardAutomationLogoBlue: {backgroundColor: '#dceeff'},
  cardAutomationLogoGreen: {backgroundColor: '#e1f3e1'},
  cardAutomationLogoText: {color: '#0f6cbd', fontSize: 18, fontWeight: '700'},
  cardBadgeRow: {alignItems: 'center', flexDirection: 'row', gap: 6},
  cardBody: {color: '#242424', fontFamily: 'Segoe UI', fontSize: 14, lineHeight: 20},
  cardCaption: {color: '#616161', fontFamily: 'Segoe UI', fontSize: 12, lineHeight: 16},
  cardDefaultExample: {alignSelf: 'center', maxWidth: 576, width: '100%'},
  cardDisabledExample: {maxWidth: 320, minWidth: 184, width: '100%'},
  cardDocumentIcon: {height: 32, resizeMode: 'contain', width: 32},
  cardFooterPage: {flexShrink: 0, minWidth: 246, width: 246},
  cardFocusExample: {maxWidth: 320, width: '100%'},
  cardFocusPreview: {aspectRatio: 1.96},
  cardHeaderPage: {width: 246},
  cardHeaderPageColumn: {gap: 16, padding: 16},
  cardHorizontalPreview: {height: 52, width: 52},
  cardIconRow: {alignItems: 'center', flexDirection: 'row', gap: 4},
  cardIntelligencePreview: {aspectRatio: 1.67},
  cardLink: {color: '#115ea3', textDecorationLine: 'underline'},
  cardMedia: {aspectRatio: 3.06, backgroundColor: '#f0f0f0'},
  cardOrientation: {maxWidth: 288, width: '100%'},
  cardPreviewPage: {aspectRatio: 3.06, width: '100%'},
  cardSection: {alignItems: 'flex-start', gap: 10, width: '100%'},
  cardSectionDescription: {color: '#242424', fontFamily: 'Segoe UI', fontSize: 14, lineHeight: 20, maxWidth: 620},
  cardSectionTitle: {color: '#242424', fontFamily: 'Segoe UI', fontSize: 16, fontWeight: '600', lineHeight: 22},
  cardSelectable: {maxWidth: 320, width: '100%'},
  cardSelectablePreview: {aspectRatio: 2.03},
  cardSizeExample: {maxWidth: 240, width: '100%'},
  cardSpaceBetween: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  cardStoryColumnLarge: {alignItems: 'flex-start', gap: 36, width: '100%'},
  cardStoryRow: {alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: 16, width: '100%'},
  cardStoryRows: {gap: 16, width: '100%'},
  cardTaskRow: {alignItems: 'flex-start', flexDirection: 'row', gap: 8},
  cardTaskText: {flex: 1, gap: 2, minWidth: 0},
  cardTemplate: {maxWidth: 224, width: '100%'},
  cardTemplateList: {gap: 16, width: 224},
  cardTemplateRow: {alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: 16, width: '100%'},
  cardTitle: {color: '#242424', fontFamily: 'Segoe UI', fontSize: 14, fontWeight: '600', lineHeight: 20},
  chevron: {color: '#424242', fontFamily: 'monospace', width: 16},
  column: {gap: 10, minWidth: 220, width: '100%'},
  carouselActionCards: {alignItems: 'stretch', flexDirection: 'row', gap: 12, overflow: 'hidden', width: '100%'},
  carouselActionCard: {backgroundColor: '#ffffff', borderRadius: 8, elevation: 8, overflow: 'hidden', width: '100%'},
  carouselActionCardImage: {height: 200, resizeMode: 'cover', width: '100%'},
  carouselActionCardInfo: {alignItems: 'center', flexDirection: 'row', gap: 10, padding: 12},
  carouselActionCardText: {flex: 1, minWidth: 0},
  carouselActiveCard: {borderColor: '#0f6cbd', borderWidth: 3},
  carouselAlignCenter: {justifyContent: 'center'},
  carouselAlignEnd: {justifyContent: 'flex-end'},
  carouselAlignStart: {justifyContent: 'flex-start'},
  carouselControlRow: {alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  carouselControlsPanel: {borderColor: '#616161', borderRadius: 4, borderWidth: 2, gap: 8, padding: 10},
  carouselDialog: {backgroundColor: '#ffffff', borderColor: '#d1d1d1', borderRadius: 8, borderWidth: 1, padding: 16},
  carouselDot: {backgroundColor: '#d1d1d1', borderRadius: 5, height: 10, width: 10},
  carouselDots: {alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'center'},
  carouselDotSelected: {backgroundColor: '#0f6cbd', borderColor: '#0f6cbd', borderWidth: 2},
  carouselElevated: {backgroundColor: '#ffffff', borderRadius: 12, elevation: 8, padding: 12},
  carouselEventLog: {borderColor: '#0f6cbd', borderRadius: 4, borderWidth: 2, gap: 8, minHeight: 80, padding: 12},
  carouselEventLogLabel: {alignSelf: 'flex-start', backgroundColor: '#0f6cbd', color: '#ffffff', fontWeight: '700', paddingHorizontal: 12, paddingVertical: 2},
  carouselFieldRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  carouselFirstRunCard: {backgroundColor: '#ffffff', width: '100%'},
  carouselFirstRunContent: {gap: 8, paddingHorizontal: 24, paddingVertical: 12},
  carouselFirstRunFooter: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  carouselFirstRunImage: {height: 324, resizeMode: 'cover', width: '100%'},
  carouselHeader: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  carouselHeaderTitle: {color: '#242424', flex: 1, fontFamily: 'Segoe UI', fontSize: 24, fontWeight: '600'},
  carouselHero: {backgroundColor: '#e6e6e6', borderRadius: 8, height: 360, overflow: 'hidden', width: '100%'},
  carouselHeroImage: {height: '100%', resizeMode: 'cover', width: '100%'},
  carouselHeroOverlay: {backgroundColor: '#ffffff', gap: 10, left: '10%', maxWidth: 270, padding: 18, position: 'absolute', top: '22%', width: '55%'},
  carouselImageSlideshow: {height: 360},
  carouselIntervalInput: {backgroundColor: '#ffffff', borderColor: '#616161', borderRadius: 4, borderWidth: 1, minWidth: 120, paddingHorizontal: 10, paddingVertical: 6},
  carouselMoreIcon: {fontSize: 20, marginLeft: 4},
  carouselNavigation: {alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center'},
  carouselNavStage: {alignItems: 'center', borderColor: '#d1d1d1', borderRadius: 8, borderWidth: 1, justifyContent: 'flex-end', minHeight: 100, padding: 16},
  carouselResponsiveRow: {alignItems: 'stretch', flexDirection: 'row', gap: 10, overflow: 'hidden', width: '100%'},
  carouselRoot: {gap: 12, minWidth: 280, width: '100%'},
  carouselThumbnail: {borderColor: '#d1d1d1', borderRadius: 4, borderWidth: 1, height: 40, overflow: 'hidden', width: 52},
  carouselThumbnailImage: {height: '100%', resizeMode: 'cover', width: '100%'},
  carouselTitle: {color: '#242424', fontFamily: 'Segoe UI', fontSize: 20, fontWeight: '600'},
  carouselTopNavigation: {alignItems: 'center', flexDirection: 'row', gap: 4},
  carouselTopNavigationDot: {backgroundColor: '#242424', borderRadius: 4, height: 8, opacity: 0.6, width: 8},
  carouselTopNavigationDotSelected: {opacity: 1, width: 16},
  carouselTopNavigationDots: {alignItems: 'center', flexDirection: 'row'},
  carouselTopNavigationDotTarget: {alignItems: 'center', height: 24, justifyContent: 'center', width: 24},
  carouselWireframe: {alignItems: 'center', backgroundColor: '#f0f0f0', borderColor: '#d1d1d1', borderRadius: 4, borderWidth: 1, height: 200, justifyContent: 'center', padding: 40, position: 'relative'},
  carouselWireframeBrand: {backgroundColor: '#cfe4fa'},
  carouselWireframeInfo: {backgroundColor: '#fdf3f4', borderColor: '#d13438', borderStyle: 'dotted', borderWidth: 1, fontFamily: 'monospace', fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, position: 'absolute', right: 12, top: 12},
  carouselWireframeLarge: {width: 350},
  carouselWireframeMedium: {width: 200},
  carouselWireframeSmall: {width: 100},
  disabledSurface: {backgroundColor: '#f0f0f0'},
  disabledText: {color: '#a0a0a0'},
  divider: {backgroundColor: '#d1d1d1', height: 1, width: '100%'},
  dividerCustom: {backgroundColor: '#eff6fc', borderRadius: 4, padding: 12},
  dividerPane: {backgroundColor: '#fafafa', flex: 1, height: 180},
  dividerVerticalStage: {alignItems: 'center', flexDirection: 'row', height: 180},
  dialogFluidAction: {flex: 1},
  dialogFluidActions: {alignSelf: 'stretch'},
  dialogMotionFill: {backgroundColor: '#0f6cbd', height: 3},
  dialogMotionPanel: {borderColor: '#616161', borderRadius: 4, borderWidth: 1, gap: 12, padding: 12},
  dialogMotionTrack: {backgroundColor: '#8a8886', height: 3, width: '100%'},
  dots: {color: '#0f6cbd', fontSize: 18, textAlign: 'center'},
  drawerStage: {alignItems: 'flex-end'},
  drawerNested: {backgroundColor: '#f5f5f5', borderLeftColor: '#0f6cbd', borderLeftWidth: 3, padding: 12},
  emptyText: {color: '#616161', padding: 12},
  errorText: {color: '#d13438', fontSize: 12},
  choiceOption: {paddingHorizontal: 10, paddingVertical: 8},
  choicePopup: {backgroundColor: '#ffffff', borderColor: '#d1d1d1', borderRadius: 4, borderWidth: 1, elevation: 4, minWidth: 180},
  comboboxActiveOption: {color: '#242424', fontFamily: 'Segoe UI', fontSize: 14, minHeight: 18},
  comboboxAppearanceField: {gap: 2},
  comboboxAppearanceInverted: {backgroundColor: '#242424', paddingBottom: 8, paddingHorizontal: 16, paddingTop: 5},
  comboboxAppearanceStack: {alignItems: 'flex-start', gap: 16},
  comboboxControl: {width: 148},
  comboboxCustomCheck: {color: '#0f6cbd', fontSize: 16},
  comboboxCustomGroupLabel: {fontStyle: 'italic'},
  comboboxDescription: {color: '#616161', fontFamily: 'Segoe UI', fontSize: 12},
  comboboxField: {alignItems: 'flex-start', gap: 2},
  comboboxLabel: {color: '#242424', fontFamily: 'Segoe UI', fontSize: 14},
  comboboxLabelInverted: {color: '#ffffff'},
  comboboxPersona: {alignItems: 'center', flexDirection: 'row', gap: 8, minHeight: 40},
  comboboxPersonaName: {color: '#242424', fontFamily: 'Segoe UI', fontSize: 14, fontWeight: '600'},
  comboboxPersonaStatus: {color: '#616161', fontFamily: 'Segoe UI', fontSize: 12},
  comboboxPersonaText: {flex: 1},
  comboboxPresence: {backgroundColor: '#107c10', borderRadius: 5, height: 10, width: 10},
  comboboxPresenceAway: {backgroundColor: '#f7630c'},
  comboboxPresenceBusy: {backgroundColor: '#d13438'},
  comboboxPresenceOut: {backgroundColor: '#8764b8'},
  comboboxStoryStack: {alignItems: 'flex-start', gap: 16},
  comboboxTagRow: {alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 4, maxWidth: 320},
  dataGrid: {maxWidth: 760, minWidth: 550, width: '100%'},
  dataGridCellActions: {alignItems: 'center', flexDirection: 'row', gap: 4},
  dataGridCellLayout: {alignItems: 'center', flex: 1, flexDirection: 'row', gap: 8, minWidth: 0},
  dataGridCellText: {color: '#242424', flex: 1, fontFamily: 'Segoe UI', fontSize: 14},
  dataGridHeaderActions: {alignItems: 'center', flex: 1, flexDirection: 'row', gap: 4, minWidth: 0},
  dataGridHeaderLabel: {color: '#242424', flex: 1, fontFamily: 'Segoe UI', fontSize: 14, fontWeight: '600'},
  dataGridIcon: {color: '#424242', fontFamily: 'Segoe Fluent Icons', fontSize: 16, width: 18},
  dataGridMenu: {alignSelf: 'flex-start', backgroundColor: '#ffffff', borderColor: '#d1d1d1', borderRadius: 4, borderWidth: 1, gap: 4, padding: 4},
  dataGridStoryStack: {alignItems: 'flex-start', gap: 8, width: '100%'},
  controlPanel: {backgroundColor: '#f5f5f5', borderRadius: 4, gap: 8, padding: 12},
  heading: {color: '#242424', fontFamily: 'Segoe UI', fontSize: 16, fontWeight: '600'},
  breadcrumbOverflowExample: {
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
    minWidth: 200,
    padding: 5,
    position: 'relative',
  },
  breadcrumbOverflowMenu: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d1d1',
    borderRadius: 4,
    borderWidth: 1,
    elevation: 8,
    left: 58,
    minWidth: 120,
    paddingVertical: 4,
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: {height: 2, width: 0},
    shadowOpacity: 0.18,
    shadowRadius: 8,
    top: 40,
    zIndex: 10,
  },
  breadcrumbOverflowMenuItem: {
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: 12,
  },
  breadcrumbOverflowMenuItemPressed: {backgroundColor: '#e8e8e8'},
  breadcrumbOverflowMenuText: {
    color: '#242424',
    fontFamily: 'Segoe UI',
    fontSize: 14,
  },
  image: {height: 120, resizeMode: 'cover', width: 180},
  imageSmall: {height: 80, width: 80},
  input: {borderColor: '#8a8886', borderRadius: 4, borderWidth: 1, color: '#242424', minHeight: 34, paddingHorizontal: 10, paddingVertical: 6},
  inputGroup: {gap: 6, maxWidth: 360, width: '100%'},
  inputGroupInline: {alignItems: 'center', flexDirection: 'row', maxWidth: 520},
  inputRow: {alignItems: 'stretch', flexDirection: 'row', gap: 4},
  infoIcon: {backgroundColor: '#0f6cbd', borderRadius: 9, color: '#ffffff', fontSize: 11, height: 18, textAlign: 'center', width: 18},
  infoLabel: {alignItems: 'center', flexDirection: 'row', gap: 6},
  label: {color: '#242424', fontSize: 14, fontWeight: '600'},
  listItem: {borderRadius: 4, minWidth: 220, paddingHorizontal: 12, paddingVertical: 9},
  menuItem: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  menuSurface: {backgroundColor: '#ffffff', borderColor: '#d1d1d1', borderRadius: 4, borderWidth: 1, elevation: 4, padding: 4},
  messageBar: {backgroundColor: '#f0f6ff', borderLeftColor: '#0f6cbd', borderLeftWidth: 4, padding: 14, width: '100%'},
  nativeCard: {maxWidth: 420, minWidth: 0, width: '100%'},
  nativeCardHorizontal: {maxWidth: 560, minWidth: 0, width: '100%'},
  nativeCardPreview: {height: 120},
  nativeCardPreviewHorizontal: {height: 140, width: 180},
  navSurface: {backgroundColor: '#f5f5f5', maxWidth: 260, padding: 8},
  overlayStage: {backgroundColor: '#f5f5f5', minHeight: 160, padding: 20, width: '100%'},
  overlaySurface: {backgroundColor: '#ffffff', borderColor: '#d1d1d1', borderRadius: 8, borderWidth: 1, gap: 12, maxWidth: 420, padding: 18},
  pill: {backgroundColor: '#f0f0f0', borderColor: '#d1d1d1', borderRadius: 14, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5},
  pillSelected: {backgroundColor: '#0f6cbd', borderColor: '#0f6cbd'},
  pillTextSelected: {color: '#ffffff'},
  presence: {backgroundColor: '#107c10', borderColor: '#ffffff', borderRadius: 6, borderWidth: 2, bottom: -1, height: 12, position: 'absolute', right: -1, width: 12},
  presenceBadge: {borderRadius: 7, height: 14, width: 14},
  presenceBadgeLarge: {borderRadius: 10, height: 20, width: 20},
  presenceBadgeOutOfOffice: {borderColor: '#8764b8', borderWidth: 3},
  counterDot: {backgroundColor: '#d13438', borderRadius: 4, height: 8, width: 8},
  portalSource: {borderColor: '#b3b3b3', borderStyle: 'dashed', borderWidth: 1, padding: 12},
  portalStage: {backgroundColor: '#f5f5f5', gap: 18, minHeight: 180, padding: 20, width: '100%'},
  portalTarget: {alignSelf: 'flex-end', backgroundColor: '#ffffff', borderColor: '#d1d1d1', borderRadius: 6, borderWidth: 1, elevation: 4, gap: 8, maxWidth: 300, padding: 16},
  progressFill: {backgroundColor: '#0f6cbd', borderRadius: 3, height: 6},
  progressFillVertical: {bottom: 0, height: '60%', position: 'absolute', width: 6},
  progressLabel: {flexDirection: 'row', justifyContent: 'space-between', minWidth: 240},
  progressTrack: {backgroundColor: '#e0e0e0', borderRadius: 3, height: 6, marginVertical: 18, minWidth: 240},
  progressTrackError: {backgroundColor: '#fdf3f4'},
  progressTrackVertical: {height: 160, minWidth: 6, width: 6},
  providerDark: {alignItems: 'center', backgroundColor: '#292929', flexDirection: 'row', gap: 12, padding: 16},
  providerDarkText: {color: '#ffffff'},
  providerLight: {alignItems: 'center', backgroundColor: '#ffffff', flexDirection: 'row', gap: 12, padding: 16},
  providerStack: {borderColor: '#d1d1d1', borderWidth: 1, gap: 1, minWidth: 320},
  rating: {color: '#f7b500', fontSize: 26},
  ratingRow: {alignItems: 'center', flexDirection: 'row', gap: 3},
  ratingStar: {color: '#f7b500', fontSize: 26},
  ratingStarEmpty: {color: '#d1d1d1'},
  row: {alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  selectedItem: {backgroundColor: '#ebf3fc'},
  skeleton: {backgroundColor: '#e0e0e0', borderRadius: 4, height: 16},
  skeletonAvatar: {backgroundColor: '#e0e0e0', borderRadius: 24, height: 48, width: 48},
  skeletonCard: {borderColor: '#e0e0e0', borderRadius: 8, borderWidth: 1, padding: 16},
  sliderThumb: {backgroundColor: '#0f6cbd', borderColor: '#ffffff', borderRadius: 8, borderWidth: 2, height: 16, left: '58%', position: 'absolute', top: -5, width: 16},
  sliderThumbVertical: {bottom: '58%', left: -5, top: undefined},
  spinnerRow: {alignItems: 'center', flexDirection: 'row', gap: 10},
  splitButtonGroup: {alignItems: 'stretch', flexDirection: 'row', gap: 0},
  successText: {color: '#107c10', fontSize: 12},
  surface: {backgroundColor: '#ffffff', borderColor: '#d1d1d1', borderRadius: 8, borderWidth: 1, gap: 12, maxWidth: 420, minWidth: 240, padding: 16},
  swatch: {borderRadius: 4, height: 32, width: 32},
  swatchSelected: {borderColor: '#242424', borderWidth: 3},
  switchPreview: {alignItems: 'center', flexDirection: 'row', gap: 10, minWidth: 180},
  tag: {alignItems: 'center', backgroundColor: '#f5f5f5', borderColor: '#d1d1d1', borderRadius: 4, borderWidth: 1, flexDirection: 'row', gap: 6, paddingHorizontal: 9, paddingVertical: 5},
  tagCircular: {borderRadius: 16},
  tagGroupVertical: {alignItems: 'flex-start', flexDirection: 'column'},
  tagIcon: {color: '#0f6cbd'},
  tagInput: {color: '#242424', minWidth: 120, padding: 4},
  tagPicker: {borderColor: '#8a8886', borderRadius: 4, borderWidth: 1, gap: 4, minWidth: 360, padding: 6},
  tagPrimary: {backgroundColor: '#0f6cbd', borderColor: '#0f6cbd'},
  tagPrimaryText: {color: '#ffffff'},
  toastStage: {alignItems: 'flex-end', justifyContent: 'flex-end'},
  toastSurface: {borderLeftColor: '#107c10', borderLeftWidth: 4, maxWidth: 360},
  toolbar: {alignItems: 'center', borderColor: '#d1d1d1', borderRadius: 4, borderWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4, padding: 4},
  tooltipBubble: {backgroundColor: '#242424', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 7},
  tooltipStage: {alignItems: 'center', gap: 8},
  tooltipText: {color: '#ffffff', fontSize: 12},
  treeChildren: {borderLeftColor: '#d1d1d1', borderLeftWidth: 1, gap: 8, marginLeft: 18, paddingLeft: 14},
  table: {borderColor: '#d1d1d1', borderWidth: 1, minWidth: 320},
  tableCell: {color: '#242424', flex: 1, padding: 8},
  tableHeader: {backgroundColor: '#f5f5f5'},
  tableHeaderText: {color: '#242424', fontWeight: '600'},
  tableRow: {borderBottomColor: '#e0e0e0', borderBottomWidth: 1, flexDirection: 'row'},
  tableSelectedRow: {backgroundColor: '#ebf3fc'},
  tableSelectionCell: {color: '#242424', padding: 8, width: 64},
  textarea: {height: 90, textAlignVertical: 'top'},
  drawerSurface: {alignSelf: 'flex-end', borderRadius: 0, minHeight: 220, width: '62%'},
});
