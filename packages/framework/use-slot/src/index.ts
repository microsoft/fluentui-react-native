export { useSlot } from './useSlot';
export type { ComponentType } from './useSlot';

// re-export functions and types from framework-base that used to be here to not break existing imports
export { renderSlot, stagedComponent, withSlots } from '@fluentui-react-native/framework-base';
export type { ComposableFunction, FinalRender, NativeReactType, SlotFn, StagedRender } from '@fluentui-react-native/framework-base';
