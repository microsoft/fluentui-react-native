// just a generic object with children specified as props
export interface IGenericProps {
  children?: React.ReactNode;
}

/**
 * this is the result of the process call.  Note that any additional information returned here
 * will flow through the system
 */
export type IProcessResult<TProps extends object = IGenericProps, TSlotProps = ISlotProps, TAdditional = object> = {
  props?: TProps;
  slotProps?: ISlotProps;
} & TAdditional;

export interface IResolvedSlotData {
  composable: IComposable;
  slots?: IResolvedSlots;
}

export type IAsResolved<TBase> = TBase & IResolvedSlotData;

/**
 * the process results, augmented with cthe composable element itself and optional slots,
 * ready to render
 */
export type IResolvedSlot<
  TProps extends object = IGenericProps,
  TSlotProps = ISlotProps,
  TAdditional extends object = object
> = IAsResolved<IProcessResult<TProps, TSlotProps, TAdditional>>;

/**
 * a collection of resolved slots
 */
export interface IResolvedSlots {
  [key: string]: IResolvedSlot;
}

/**
 * props to pass to the sub-components, keys should match slots
 */
export interface ISlotProps {
  root: IGenericProps;
  [key: string]: IGenericProps;
}

/**
 * Pattern for a composable component
 */
export interface IComposable {
  useProcessProps: (props: IGenericProps, theme: object) => IProcessResult;
  render: (propInfo: IProcessResult, ...children: React.ReactNode[]) => JSX.Element | null;
  slots?: { [key: string]: IComposable };
}

/**
 * Attach a composable component to an object in a standard manner
 */
export type IWithComposable<T extends object = object> = T & {
  __composable: IComposable;
};

/**
 * Generally a slot can be defined as a standard input to createElement or as an object with a __composable value
 * set on it
 */
/* tslint:disable-next-line no-any */
export type INativeSlotType = React.ElementType<any> | string;
export type ISlotType = INativeSlotType | IWithComposable<object>;

/**
 * Optional function to filter the properties that will be passed to the component.  If no props are to be
 * removed it should return the same object.  Otherwise it should return a new object with props filtered
 */
export type IPropFilter = (props: object) => object;

/**
 * In the case where a filter needs to be applied to props the slot can be set to an object which contains the slotType
 * and filter function reference
 */
export interface ISlotWithFilter {
  slotType?: ISlotType;
  filter?: IPropFilter;
}

/**
 * The collection of slot types that should be defined on the definition of a component
 */
export type ISlotTypes = {
  root: ISlotType | ISlotWithFilter;
  [key: string]: ISlotType | ISlotWithFilter;
};
