import { ICustomizedSettings, ICustomizedValueType, IPropFunction, IWithTheme, ICustomizedResult } from './Customize.types';
import { IComponentSettings } from '../../foundation-settings/lib';
const JSON5 = require('json5');

export function customize<TSettings extends IComponentSettings, TProps extends object>(
  inputParts: TemplateStringsArray,
  ...inputKeys: ICustomizedValueType<TProps>[]
): ICustomizedSettings<TSettings, TProps> {
  const { parts, keys } = _reduceKeys(inputParts, ...inputKeys);
  const settings = keys.length === 0 ? _toSettings<TSettings>(parts[0]) : undefined;
  return {
    queryKeys: (props: IWithTheme<TProps>) => {
      return keys.length === 0
        ? []
        : keys.map((fn: IPropFunction<TProps>) => {
          const val = fn(props);
          return _stringifyValue(val);
        });
    },
    getSettings: settings
      ? () => settings
      : (keysParam: string[]) => {
        const settingsString: string = parts
          .map((part: string, index: number) => {
            return index < keysParam.length ? part + keysParam[index] : part;
          })
          .join();
        return _toSettings(settingsString);
      },
    settings
  };
}

function _stringifyValue(val: ICustomizedResult): string {
  return typeof val === 'string' ? "'" + val + "'" : String(val);
}

interface IReduceResult {
  parts: TemplateStringsArray;
  keys: any[];
}

function _reduceKeys<TProps>(parts: TemplateStringsArray, ...keys: ICustomizedValueType<TProps>[]): IReduceResult {
  const toRemove = keys
    .map((key, index) => {
      return { key, index };
    })
    .filter(val => typeof val.key != 'function');
  if (toRemove.length > 0) {
    // create copies of the arrays to modify
    let newParts = parts.slice(0);
    let newKeys = keys.slice(0);

    // work from the end to compress the values
    for (let i = toRemove.length - 1; i >= 0; i--) {
      // we are removing a key index and joining the strings from parts[key index] and parts[key index + 1]
      const join = _stringifyValue(toRemove[i].key as ICustomizedResult);
      newParts[i] = newParts[i] + join + newParts[i + 1];
      newParts = newParts.splice(i + 1, 1);
      newKeys = newKeys.splice(i, 1);
    }
    return { parts: (newParts as unknown) as TemplateStringsArray, keys: newKeys };
  }
  return { parts, keys };
}

function _toSettings<TSettings extends IComponentSettings>(stringVal: string): TSettings {
  return JSON5.parse(stringVal) as TSettings;
}
