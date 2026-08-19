/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ComponentProps } from 'react';

import type { Button } from '../components/button/button';
import type { Card } from '../components/card/card';
import type { ListItem } from '../components/list-item/list-item';
import type { ListboxItem } from '../components/listbox-item/listbox-item';
import type { MenuItem } from '../components/menu-item/menu-item';
import type { Radio } from '../components/radio/radio';
import type { Tab } from '../components/tab/tab';
import type { SelectionStateProps } from './selection.types';

type SelectionCapable = ComponentProps<typeof Button> &
  ComponentProps<typeof Card> &
  ComponentProps<typeof ListItem> &
  ComponentProps<typeof ListboxItem> &
  ComponentProps<typeof MenuItem> &
  ComponentProps<typeof Radio> &
  ComponentProps<typeof Tab>;

// Every component with a selection axis accepts the full externally driven and internally driven prop triple.
const ExternallyDriven: SelectionStateProps = { onSelectedChange: (_selected: boolean) => undefined, selected: true };
const InternallyDriven: SelectionStateProps = { defaultSelected: true, onSelectedChange: (_selected: boolean) => undefined };
const Omitted: SelectionStateProps = {};

const acceptsSelection = (props: SelectionCapable) => props;

// @ts-expect-error selection values are boolean, not arbitrary strings.
const InvalidSelected: SelectionStateProps = { selected: 'yes' };

// @ts-expect-error the change callback receives the next boolean value.
const InvalidChange: SelectionStateProps = { onSelectedChange: (_selected: string) => undefined };

describe('selection state types', () => {
  it('accepts externally driven, internally driven, and omitted selection props', () => {
    expect(ExternallyDriven).toBeDefined();
    expect(InternallyDriven).toBeDefined();
    expect(Omitted).toBeDefined();
    expect(acceptsSelection).toBeDefined();
  });
});
