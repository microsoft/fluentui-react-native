import { IMockTheme } from './MockTheme';
import { ITargetHasToken, IComponentTokens, ISlotStyleFactories } from './Token.types';
import { IStyleProp, mergeSettings, ISlotProps, IComponentSettings } from '@uifabricshared/foundation-settings';
import { processTokens } from './Token';
import { buildComponentTokens } from './Token.function';

export type ICSSStyle = React.CSSProperties;

export interface IMockBaseProps {
  style?: IStyleProp<ICSSStyle>;
}

export type IMockComponentFn<TProps, TSlotProps extends ISlotProps, TTokens> = (
  props: TProps,
  settings: IComponentSettings<TSlotProps> & { tokens?: TTokens },
  theme: IMockTheme,
  cache: object,
  recurse?: boolean
) => TSlotProps | TProps;

export type IMockComponent<TProps, TSlotProps extends ISlotProps, TTokens> = IMockComponentFn<TProps, TSlotProps, TTokens> & {
  __options?: IComponentTokens<TSlotProps, TTokens, IMockTheme>;
};

export type IMockSlots<TSlotProps extends ISlotProps, TTokens> = {
  [K in keyof TSlotProps]: { component: any } & ISlotStyleFactories<TSlotProps[K], TTokens, IMockTheme>;
};

export interface IMockComponentOptions<TSlotProps extends ISlotProps, TTokens> {
  slots?: IMockSlots<TSlotProps, TTokens>;
}

export function stockFakeComponent(
  props: IMockBaseProps,
  _settings: ISlotProps,
  _theme: IMockTheme,
  _cache: object,
  _recurse: boolean
): IMockBaseProps {
  return props;
}

export function mockCreate<TProps extends object, TSlotProps extends ISlotProps, TTokens extends object>(
  options: IMockComponentOptions<TSlotProps, TTokens>
): IMockComponent<TProps, TSlotProps, TTokens> {
  const slots = options.slots;
  const hasTokens: ITargetHasToken = slots
    ? (target: string, key: string) => {
        const targetOptions = slots[target] && slots[target].component && slots[target].component.__options;
        return targetOptions && targetOptions.tokenKeys.hasOwnProperty(key);
      }
    : undefined;
  const resolvedTokens: IComponentTokens<TSlotProps, TTokens, IMockTheme> = buildComponentTokens<TSlotProps, TTokens, IMockTheme>(
    slots,
    hasTokens
  );
  const fn = (props: TProps, settings: TSlotProps & { tokens?: TTokens }, theme: IMockTheme, cache: object, recurse?: boolean) => {
    let newSettings = processTokens(props as any, theme, settings, resolvedTokens, 'base', cache);
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
    const { tokens, ...nonTokenSettings } = newSettings as TSlotProps & { tokens?: TTokens };
    return nonTokenSettings;
  };
  (fn as IMockComponent<TProps, TSlotProps, TTokens>).__options = resolvedTokens;
  return fn as IMockComponent<TProps, TSlotProps, TTokens>;
}
