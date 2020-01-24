import { IDocPageProps } from 'office-ui-fabric-react/lib/common/DocPage.types';

export type Resolver = (path: string) => string;

export type DocPagePropsFactory = (load: Resolver, getUrl: Resolver) => IDocPageProps;
