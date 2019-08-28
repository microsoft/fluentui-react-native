import { IMockTheme } from './MockTheme';
import { IResolvedComponentTokenInfo, ITokenEntry, ITargetHasTokens } from '../Token.types';
import { IStyleProp, IComponentSettings, mergeSettings } from '@uifabric/theme-settings';
import { prepareTokensForRender, processTokens, targetHasTokens } from '../Token';

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

export type IMockComponent<TProps, TSlotProps> = IMockComponentFn<TProps, TSlotProps> & { __options?: IResolvedComponentTokenInfo };

export interface IMockSlots {
  [key: string]: IMockComponent<IMockBaseProps, IComponentSettings>;
}

export interface IMockComponentOptions<TProps extends object> {
  tokens?: ITokenEntry<TProps, IMockTheme>[];
  slots?: IMockSlots;
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
  const { tokens, slots } = options;
  const hasTokens: ITargetHasTokens = slots
    ? (target: string, keys: string[]) => {
        const targetOptions = slots[target] && slots[target].__options;
        return targetOptions ? targetHasTokens(targetOptions.tokenKeys, keys) : false;
      }
    : undefined;
  const resolvedTokens: IResolvedComponentTokenInfo = prepareTokensForRender(tokens as ITokenEntry<object>[], hasTokens);
  const fn = (props: TProps, settings: TSettings, theme: IMockTheme, cache: object, recurse?: boolean) => {
    let newSettings = processTokens(props, theme, settings, resolvedTokens, 'base', cache);
    if (recurse) {
      Object.keys(slots).forEach((slotName: string) => {
        const slot = slots[slotName];
        if (slot.__options && newSettings[slotName]) {
          cache[slotName] = cache[slotName] || {};
          const slotSettings = slot(newSettings[slotName], {}, theme, cache[slotName]);
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
