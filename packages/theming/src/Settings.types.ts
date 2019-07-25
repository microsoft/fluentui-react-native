export interface ISlotProps<TProps extends object = object> {
  root: TProps;
}

export type IPartialSlotProps<TSlotProps extends ISlotProps> = { [K in keyof TSlotProps]+?: Partial<TSlotProps[K]> };

export type IComponentSettings<TSlotProps extends ISlotProps = ISlotProps> = IPartialSlotProps<TSlotProps> & {
  _parent?: string | string[];
  _precedence?: string[];
  _overrides?: IComponentSettingsCollection<IComponentSettings<TSlotProps>>;
};

export type IComponentSettingsCollection<TSettings extends IComponentSettings = IComponentSettings> = {
  [key: string]: TSettings;
};
