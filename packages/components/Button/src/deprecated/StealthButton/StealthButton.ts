import { Button } from '../Button';
import { settings } from './StealthButton.settings';

/**
 * @deprecated This component is deprecated in favor of ButtonV2. The StealthButton will be removed when the package moves to 1.0.0.
 * At that point, ButtonV2 will be renamed to Button. Please see MIGRATION.md for details on how to move to the new Button.
 */
export const StealthButton = Button.compose({ displayName: 'StealthButton', settings });
