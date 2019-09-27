import * as React from 'react';
import { IRenderData, ISlotWithFilter, IComposable, IWithComposable, ISlots, IPropFilter, INativeSlotType } from './Composable.types';
import { mergeSettings, mergeProps, ISlotProps } from '@uifabricshared/foundation-settings';

export type ISlotFn<TProps> = React.FunctionComponent<TProps> & {
  _canCompose?: boolean;
};

interface ISlotRenderInfo<TProps extends object = object, TSlotProps extends ISlotProps = ISlotProps<TProps>, TState = object> {
  composable: IComposable<TProps, TSlotProps, TState>;
  renderData?: IRenderData<TSlotProps, TState>;
  slotInfo?: ISlotWithFilter;
  childInfo?: { [key: string]: ISlotRenderInfo<TProps, TSlotProps, TState> };
  Slots?: ISlots<TSlotProps>;
}

function _mergeAndFilterProps<TProps extends object>(
  propsBase: TProps,
  propsExtra: TProps,
  filter: IPropFilter | undefined,
  ...children: React.ReactNode[]
): TProps {
  // do a basic merge, not mutating if nothing changed
  let props = mergeProps<TProps>(propsBase, propsExtra, children && children.length > 0 ? { children } : undefined);
  if (filter && props) {
    const removeMask = {};
    Object.getOwnPropertyNames(props).forEach(key => {
      if (!filter(key)) {
        removeMask[key] = undefined;
      }
    });
    props = mergeProps(props, removeMask);
  }
  return props;
}

/**
 * Helper function to add the _canCompose settings to a given render function
 * @param fn - function to decorate with _canCompose
 */
function _createSlotRenderFunction<TProps extends object>(fn: React.FunctionComponent<TProps>): React.FunctionComponent<TProps> {
  (fn as ISlotFn<TProps>)._canCompose = true;
  return fn;
}

function createSlotRenderInfo<TProps extends object, TSlotProps extends ISlotProps = ISlotProps<TProps>, TState = object>(
  composable: IComposable<TProps, TSlotProps, TState>,
  slotInfo?: ISlotWithFilter
): ISlotRenderInfo<TProps, TSlotProps, TState> {
  const renderInfo: ISlotRenderInfo<TProps, TSlotProps, TState> = { composable, slotInfo };
  const slots = composable && composable.slots;
  if (slots) {
    const Slots = (renderInfo.Slots = {} as ISlots<TSlotProps>);
    const childInfo = (renderInfo.childInfo = {});

    Object.getOwnPropertyNames(slots).forEach(slot => {
      const { slotType, filter } = slots[slot];
      const composable = (typeof slotType === 'object' && (slotType as IWithComposable<object>).__composable) || undefined;
      const childRenderInfo = (childInfo[slot] = createSlotRenderInfo(composable, slots[slot]));
      if (composable) {
        // create the actual closure for rendering handing it a reference to the render info
        Slots[slot] = _createSlotRenderFunction((extraProps: TProps, ...children: React.ReactNode[]) => {
          const { renderData, Slots } = childRenderInfo;
          if (filter || extraProps) {
            const toMerge = { root: _mergeAndFilterProps(renderData.slotProps.root, extraProps, filter, ...children) };
            renderData.slotProps = mergeSettings(renderData.slotProps, toMerge);
          }
          return composable.render(Slots, renderData);
        });
      } else {
        // non-composable components should just render directly
        Slots[slot] = _createSlotRenderFunction((extraProps: TProps, ...children: React.ReactNode[]) => {
          const props = _mergeAndFilterProps(childRenderInfo.renderData.slotProps.root, extraProps, filter);
          return React.createElement(slotType as INativeSlotType, props, ...children);
        });
      }
    });
  }
  return renderInfo;
}

function useUpdateRenderData<TProps extends object, TSlotProps extends ISlotProps = ISlotProps<TProps>, TState = object>(
  props: TProps,
  info: ISlotRenderInfo<TProps, TSlotProps, TState>
): { renderData: IRenderData<TSlotProps, TState>; Slots: ISlots<TSlotProps> } {
  // update the render data for this level of the hierarchy
  if (info.composable) {
    const { usePrepareProps, useStyling } = info.composable;
    info.renderData = usePrepareProps(props, useStyling) || {};
  } else {
    info.renderData = { slotProps: ({ root: props } as unknown) as TSlotProps };
  }

  // now traverse to children if needed
  const childInfo = info.childInfo;
  if (childInfo) {
    const slotProps = info.renderData.slotProps || {};
    Object.getOwnPropertyNames(childInfo).forEach(child => {
      useUpdateRenderData(slotProps[child], childInfo[child]);
    });
  }

  // return the updated renderData and cached Slots
  return { renderData: info.renderData, Slots: info.Slots };
}

/**
 * Driver function for the prop preparation phase of rendering a composable control
 *
 * @param props - user props send to prepare props
 * @param composable - composable for this component
 */
export function useCompoundPrepare<TProps extends object, TSlotProps extends ISlotProps = ISlotProps<TProps>, TState = object>(
  props: TProps,
  composable: IComposable<TProps, TSlotProps, TState>
): { renderData: IRenderData<TSlotProps, TState>; Slots: ISlots<TSlotProps> } {
  // create the slot render info (which may be a tree) and store it into state once.  Note that this will also create any
  // needed closures for the slots to ensure they don't get recreated over the lifetime of the component
  const [renderInfo] = React.useState(createSlotRenderInfo(composable));

  // process the props of the tree using the created/retrieved renderInfo
  return useUpdateRenderData(props, renderInfo);
}
