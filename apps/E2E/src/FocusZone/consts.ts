import { FocusZoneDirection } from '@fluentui-react-native/focus-zone';

export const HOMEPAGE_FOCUSZONE_BUTTON = 'Homepage_FocusZone_Button';
export const FOCUSZONE_TESTPAGE = 'FocusZone_TestPage';

/* E2E Testing FocusZone 1 */
export const FOCUSZONE_TEST_COMPONENT = 'FocusZone_Test_Component'; // A component on each specific test page

/* E2E Testing FocusZone 2 */
export const FOCUSZONE_SECOND_TEST_COMPONENT = 'FocusZone_Second_Test_Component';

/* FocusZone List Wrapper Buttons Keys */
export const FOCUSZONE_GRID_BEFORE = 'FocusZone_Grid_Before';
export const FOCUSZONE_GRID_AFTER = 'FocusZone_Grid_After';

/* Grid Button Test IDs */
export const FOCUSZONE_GRID_BUTTON = (idx: number) => `FocusZone_GridButton_${idx}`;

export const FOCUSZONE_TWO_DIM_SWITCH = 'FocusZone_2D_Switch';
export const FOCUSZONE_DISABLED_SWITCH = 'FocusZone_Disabled_Switch';
export const FOCUSZONE_DEFAULT_TABBABLE_SWITCH = 'FocusZone_Default_Tabbable_Switch';
export const FOCUSZONE_CIRCLE_NAV_SWITCH = 'FocusZone_Circular_Navigation_Switch';

export const FOCUSZONE_DIRECTION_PICKER = 'FocusZone_Direction_Picker';
export const FOCUSZONE_DIRECTION_ID = (direction: FocusZoneDirection) => `FocusZone_Direction_Opt_${direction}`;
