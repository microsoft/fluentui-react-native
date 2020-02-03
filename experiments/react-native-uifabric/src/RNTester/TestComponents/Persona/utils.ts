import { UIManager } from 'react-native';

export function getAllEnumValues<T extends object>(o: T): string[] {
  return Object.keys(o).filter(item => {
    return isNaN(Number(item));
  });
}

export const canUsePickerComponent = UIManager.getViewManagerConfig('RCTPicker') !== null;
