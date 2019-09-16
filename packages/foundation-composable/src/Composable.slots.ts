import * as React from 'react';
import { IRootSlotProps, IRenderData, ISlotWithFilter, IUsePrepareProps, IComposable, IWithComposable } from './Composable.types';

type ISlotFn<TProps extends object> = React.FunctionComponent<TProps> & {
  _canCompose?: boolean;
};

export interface ISlotRenderInfo<TProps extends object = object> {
  props?: TProps;
  renderData?: IRenderData<IRootSlotProps<TProps>>;
  slotInfo?: ISlotWithFilter;
  childInfo?: { [key: string]: ISlotRenderInfo };
  Slots?: { [key: string]: ISlotFn<TProps> };
}

function createSlotFunction<TProps extends object>(renderInfo: ISlotRenderInfo): React.FunctionComponent<TProps> {}

function createSlotRenderInfo<TProps extends object>(composable: IComposable<TProps>, slotInfo?: ISlotWithFilter): ISlotRenderInfo<TProps> {
  const renderInfo: ISlotRenderInfo<TProps> = {};
  const { slots } = composable;
  if (slots) {
    renderInfo.Slots = {};
    renderInfo.childInfo = {};
    const Slots = {};
    const childInfo = {};

    Object.getOwnPropertyNames(slots).forEach(slot => {
      const { slotType } = slots[slot];
      const composable = (typeof slotType === 'object' && (slotType as IWithComposable<object>).__composable) || undefined;
      if (composable) {
        // create render info for the child
        childInfo[slot] = createSlotRenderInfo(composable);
        // create the actual closure for rendering
        Slots[slot] = childInfo[slot];
      } else {
        // just refer to the component directly
        Slots[slot] = slotType;
      }
    });
  }
}

function useCompoundPrepareWorker<TProps extends object>(props: TProps, composable: IComposable<TProps>): ISlotRenderInfo<TProps> {}

function useCompoundPrepare<TProps extends object>(props: TProps, composable: IComposable<TProps>): ISlotRenderInfo<TProps> {
  const { slots, usePrepareProps } = composable;
  const [renderInfo] = React.useState({} as ISlotRenderInfo<TProps>);

  renderInfo.props = props;
}
