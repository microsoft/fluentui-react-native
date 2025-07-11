import { NativeModules } from 'react-native';

export const NativeAppearanceAdditions = NativeModules.FRNAppearanceAdditions;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type NativeAppearanceAdditionsInterface = {};

export default NativeAppearanceAdditions as NativeAppearanceAdditionsInterface;
