export interface ISlotProps<TProps extends object = object> {
  root: TProps;
}

export type IWithTokens<T, TTokens extends object> = T & { tokens?: TTokens };

export type IPartialSlotProps<TSlotProps extends ISlotProps> = { [K in keyof TSlotProps]+?: Partial<TSlotProps[K]> };

export type IComponentSettings<TSlotProps extends ISlotProps = ISlotProps> = IPartialSlotProps<TSlotProps> & {
  _precedence?: string[];
  _overrides?: IComponentSettingsCollection<IWithTokens<IComponentSettings<TSlotProps>, object>>;
};

export type IComponentSettingsCollection<
  TSettings extends IWithTokens<IComponentSettings, object> = IWithTokens<IComponentSettings, object>,
> = {
  [key: string]: TSettings;
};

/**
 * overrides are looked up using an object where override names are evaluated against the object.  If the values are truthy
 * the override will be applied.
 */
export interface IOverrideMask {
  [key: string]: any;
}

/**
 * alternatively look them up with a passed in function
 */
export type IOverrideFunction = (name: string) => boolean;

/**
 * Lookup overrides by function or by mask
 */
export type IOverrideLookup = IOverrideFunction | IOverrideMask;
