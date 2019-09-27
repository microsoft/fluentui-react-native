import { ISlotProps } from '@uifabricshared/foundation-settings';

export type IUseStyling<TProps extends object, TSlotProps extends ISlotProps = ISlotProps<TProps>> = (props: TProps) => TSlotProps;

/**
 * Pattern for a composable component
 */
export interface IComposable<TProps extends object, TSlotProps extends ISlotProps = ISlotProps<TProps>, TState = object> {
  /**
   * Injectable styling for the component.  If not specified this will return an empty object
   * @param props - user input props to process for styling
   */
  useStyling: IUseStyling<TProps, TSlotProps>;

  /**
   * process the user props and return an IRenderData object with slot props and an optional state.
   * @param props - user props to be used for processing
   */
  usePrepareProps: (props: TProps, useStyling: IUseStyling<TProps, TSlotProps>) => IRenderData<TSlotProps, TState>;

  /**
   * perform the actual building of the JSX tree.
   * @param Slots - slots, keyed to the values of TSlotProps, suitable to be rendered via renderSlot or JSX syntax
   * @param renderData - IRenderData returned from usePrepareProps
   * @param children - The react children property in the form passed into React.createElement
   */
  render: (Slots: ISlots<TSlotProps>, renderData: IRenderData<TSlotProps, TState>) => JSX.Element | null;

  /**
   * The slot definitions for this component.  If this only has one sub-component this will only have a root entry.  Using
   * the render helpers to render will automatically include props processed from usePrepareProps
   */
  slots: ISlotDefinitions<TSlotProps>;
}

export type IComposableDefinition<TProps extends object, TSlotProps extends ISlotProps = ISlotProps<TProps>, TState = any> = Partial<
  IComposable<TProps, TSlotProps, TState>
>;

type IWithChildren<TProps extends object> = TProps & { children?: object };
export type IChildrenFromProps<TProps extends object> = TProps extends IWithChildren<TProps> ? TProps['children'] : React.ReactNode;

/**
 * data returned from prop preparation which will be handed to render
 */
export interface IRenderData<TSlotProps extends ISlotProps, TState = any> {
  /**
   * slot props returned from usePrepareProps
   */
  slotProps?: TSlotProps;

  /**
   * component specific state value
   */
  state?: TState;

  /**
   * convenience point for passing children to render
   */
  children?: IChildrenFromProps<TSlotProps['root']>;
}

/**
 * Mapped type for the resolved/render-ready slots, keyed off of TSlotProps
 */
export type ISlots<TSlotProps extends ISlotProps> = {
  [K in keyof TSlotProps]: React.FunctionComponent<TSlotProps[K]>;
};

/**
 * Mapped type for the slot definitions, keyed off of TSlotProps
 */
export type ISlotDefinitions<TSlotProps extends ISlotProps> = {
  [K in keyof TSlotProps]: ISlotWithFilter;
};

/**
 * Attach a composable component to an object in a standard manner
 */
export type IWithComposable<T extends object = object, TComposable = IComposable<object>> = T & {
  __composable: TComposable;
};

/**
 * Generally a slot can be defined as a standard input to createElement or as an object with a __composable value
 * set on it
 */
export type INativeSlotType = React.ElementType<any> | string;

/**
 * Optional function to filter the properties that will be passed to the component.  If no props are to be
 * removed it should return the same object.  Otherwise it should return a new object with props filtered
 */
export type IPropFilter = (propName: string) => boolean;

/**
 * In the case where a filter needs to be applied to props the slot can be set to an object which contains the slotType
 * and filter function reference
 */
export type ISlotWithFilter<TMixin = object> = {
  slotType?: INativeSlotType;
  filter?: IPropFilter;
} & TMixin;
