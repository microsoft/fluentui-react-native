import type { BreadcrumbProps } from './breadcrumb.types';
import { renderBreadcrumb_unstable } from './renderBreadcrumb';
import { useBreadcrumb_unstable } from './useBreadcrumb';
import { useBreadcrumbStyles_unstable } from './useBreadcrumbStyles';

export const Breadcrumb = (props: BreadcrumbProps) => {
  const state = useBreadcrumb_unstable(props);
  useBreadcrumbStyles_unstable(state);
  return renderBreadcrumb_unstable(state);
};
Breadcrumb.displayName = 'Breadcrumb';
