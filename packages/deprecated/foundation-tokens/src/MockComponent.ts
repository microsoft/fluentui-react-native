import type { GetMemoValue, StyleProp } from '@fluentui-react-native/framework-base';
import type { ISlotProps, IComponentSettings } from '@uifabricshared/foundation-settings';
import { mergeSettings } from '@uifabricshared/foundation-settings';

import type { IMockTheme } from './MockTheme';
import { processTokens } from './Token';
import { buildComponentTokens } from './Token.function';
import type { ITargetHasToken, IComponentTokens, IStyleFactories } from './Token.types';

export type ICSSStyle = React.CSSProperties;

export interface IMockBaseProps {
  style?: StyleProp<ICSSStyle>;
}

export type IMockComponentFn<TProps, TSlotProps extends ISlotProps, TTokens> = (
  props: TProps,
  settings: IComponentSettings<TSlotProps> & { tokens?: TTokens },
  theme: IMockTheme,
  cache: GetMemoValue,
  recurse?: boolean,
) => TSlotProps | TProps;

export type IMockComponent<TProps, TSlotProps extends ISlotProps, TTokens> = IMockComponentFn<TProps, TSlotProps, TTokens> & {
  __options?: IComponentTokens<TSlotProps, TTokens, IMockTheme>;
};

export type IMockSlots<TSlotProps extends ISlotProps> = { [K in keyof TSlotProps]: any };

export interface IMockComponentOptions<TSlotProps extends ISlotProps, TTokens> {
  slots?: IMockSlots<TSlotProps>;
  styles?: IStyleFactories<TSlotProps, TTokens, IMockTheme>;
}

export function stockFakeComponent(
  props: IMockBaseProps,
  _settings: ISlotProps,
  _theme: IMockTheme,
  _cache: GetMemoValue,
  _recurse: boolean,
): IMockBaseProps {
  return props;
}

export function mockCreate<TProps extends object, TSlotProps extends ISlotProps, TTokens extends object>(
  options: IMockComponentOptions<TSlotProps, TTokens>,
): IMockComponent<TProps, TSlotProps, TTokens> {
  const slots = options.slots;
  const hasTokens: ITargetHasToken = slots
    ? (target: string, key: string) => {
        const targetOptions = slots[target] && slots[target].__options;
        return targetOptions && targetOptions.tokenKeys.hasOwnProperty(key);
      }
    : undefined;
  const resolvedTokens: IComponentTokens<TSlotProps, TTokens, IMockTheme> = buildComponentTokens<TSlotProps, TTokens, IMockTheme>(
    options.styles,
    hasTokens,
  );
  const fn = (props: TProps, settings: TSlotProps & { tokens?: TTokens }, theme: IMockTheme, cache: GetMemoValue, recurse?: boolean) => {
    let newSettings = processTokens(props as any, theme, settings as any, resolvedTokens, cache);
    if (recurse) {
      Object.keys(slots).forEach((slotName: string) => {
        const slot = slots[slotName];
        if (slot.__options && newSettings[slotName]) {
          const [, slotCache] = cache(null, [slotName]);
          const slotSettings = slot(newSettings[slotName] || {}, {}, theme, slotCache, false);
          const rootKey = 'root';
          if (slotSettings[rootKey]) {
            newSettings = mergeSettings(newSettings, { [slotName]: slotSettings[rootKey] } as TSlotProps);
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
