import { IMockTheme } from './MockTheme';
import { ITargetHasToken, IComponentTokens, ISlotStyleFactories } from './Token.types';
import { IStyleProp, IComponentSettings, mergeSettings } from '@uifabric/foundation-settings';
import { processTokens } from './Token';
import { buildComponentTokens } from './Token.function';

export type ICSSStyle = React.CSSProperties;

export interface IMockBaseProps {
  style?: IStyleProp<ICSSStyle>;
}

export type IMockComponentFn<TProps, TSlotProps> = (
  props: TProps,
  settings: TSlotProps,
  theme: IMockTheme,
  cache: object,
  recurse?: boolean
) => TSlotProps | TProps;

export type IMockComponent<TProps, TSlotProps> = IMockComponentFn<TProps, TSlotProps> & {
  __options?: IComponentTokens<TProps, IMockTheme>;
};

export type IMockSlots<TProps> = {
  root: { component: IMockComponent<TProps, IComponentSettings> } & ISlotStyleFactories<TProps, IMockTheme>;
  [key: string]: { component: IMockComponent<TProps, IComponentSettings> } & ISlotStyleFactories<TProps, IMockTheme>;
};

export interface IMockComponentOptions<TProps> {
  slots?: IMockSlots<TProps>;
}

export function stockFakeComponent(
  props: IMockBaseProps,
  _settings: IComponentSettings,
  _theme: IMockTheme,
  _cache: object,
  _recurse: boolean
): IMockBaseProps {
  return props;
}

export function mockCreate<TProps extends object, TSettings extends IComponentSettings>(
  options: IMockComponentOptions<TProps>
): IMockComponent<TProps, TSettings> {
  const slots = options.slots;
  const hasTokens: ITargetHasToken = slots
    ? (target: string, key: string) => {
      const targetOptions = slots[target] && slots[target].component && slots[target].component.__options;
      return targetOptions && targetOptions.tokenKeys.hasOwnProperty(key);
    }
    : undefined;
  const resolvedTokens: IComponentTokens<TProps, IMockTheme> = buildComponentTokens<TProps, IMockTheme>(slots, hasTokens);
  const fn = (props: TProps, settings: TSettings, theme: IMockTheme, cache: object, recurse?: boolean) => {
    let newSettings = processTokens(props, theme, settings, resolvedTokens, 'base', cache);
    if (recurse) {
      Object.keys(slots).forEach((slotName: string) => {
        const slot = slots[slotName];
        if (slot.component.__options && newSettings[slotName]) {
          cache[slotName] = cache[slotName] || {};
          const slotSettings = slot.component(newSettings[slotName] || {}, {}, theme, cache[slotName], false);
          const rootKey = 'root';
          if (slotSettings[rootKey]) {
            newSettings = mergeSettings(newSettings, { [slotName]: slotSettings[rootKey] });
          }
        }
      });
    }
    return newSettings;
  };
  (fn as IMockComponent<TProps, TSettings>).__options = resolvedTokens;
  return fn as IMockComponent<TProps, TSettings>;
}
