// filter function implementations
type IWithChildren<T> = T & { children?: React.ReactNode[] };
type IPropMask<TProps> = { [P in keyof TProps]-?: boolean };
export type IFilterMask<TProps> = IPropMask<IWithChildren<TProps>>;
