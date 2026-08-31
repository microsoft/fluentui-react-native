/** @jsxImportSource @fluentui-react-native/framework-base */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tab } from '../tab/tab';
import { TabList } from './tablist';

const UncontrolledTabList = (
  <TabList defaultSelectedValue="overview">
    <Tab controls="overview-panel" content="Overview" value="overview" />
    <Tab controls="activity-panel" content="Activity" value="activity" />
  </TabList>
);

const ControlledVerticalTabList = (
  <TabList
    accessibilityLabel="Settings sections"
    circularNavigation={false}
    onSelectionChange={(_value) => undefined}
    orientation="vertical"
    selectedValue="profile"
    selectionFollowsFocus={false}
  >
    <Tab controls="profile-panel" content="Profile" value="profile" />
    <Tab controls="privacy-panel" content="Privacy" value="privacy" />
  </TabList>
);

// @ts-expect-error children are required.
const MissingChildren = <TabList />;

// @ts-expect-error orientation accepts only the supported axes.
const InvalidOrientation = <TabList orientation="diagonal">{UncontrolledTabList}</TabList>;

// @ts-expect-error selected values are strings.
const InvalidSelectedValue = <TabList selectedValue={1}>{UncontrolledTabList}</TabList>;

describe('TabList types', () => {
  it('accepts controlled, uncontrolled, and group-aware Tab props', () => {
    expect(UncontrolledTabList).toBeDefined();
    expect(ControlledVerticalTabList).toBeDefined();
  });
});
