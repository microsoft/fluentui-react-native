// Separate .d.ts file to fool codegen, since ImageSource does not exist in the TS types of RN currently.
export type { ImageURISource as ImageSource } from 'react-native/Libraries/Image/ImageSource';
export type UnsafeMixed = any;
