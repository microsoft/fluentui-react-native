import { View } from 'react-native';
import { separatorName, ISeparatorType } from './Separator.types';
import { compose } from '@uifabricshared/foundation-compose';
import { filterViewProps } from '../../utilities/RenderHelpers';
import { separatorTokenProcessor } from './Separator.helpers';
import { settings } from './Separator.settings';
import { getPaletteFromTheme } from '../../tokens';

export const Separator = compose<ISeparatorType>({
  displayName: separatorName,
  settings: settings,
  slots: {
    root: {
      slotType: View,
      filter: filterViewProps
    }
  },
  styles: {
    root: [separatorTokenProcessor, [{ source: 'color', lookup: getPaletteFromTheme, target: 'borderColor' }]]
  }
});

export default Separator;
