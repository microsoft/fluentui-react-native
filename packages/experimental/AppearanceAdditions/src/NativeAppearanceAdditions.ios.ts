import { NativeModules } from 'react-native';

export const NativeAppearanceAdditions = NativeModules.FRNAppearanceAdditions;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface NativeAppearanceAdditionsInterface {}

export default NativeAppearanceAdditions as NativeAppearanceAdditionsInterface;
