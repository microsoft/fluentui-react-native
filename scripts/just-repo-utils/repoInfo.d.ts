import { RepoInfo } from './interfaces/repoInfoTypes';
/**
 * Everyone seems to have one of these, so this is a common implementation that can
 * be leveraged by different utilities.
 *
 * @param cb - callback function to execute at each level.  A true result for the callback will
 * cancel the walk and return the current path at the time it was cancelled.
 */
export declare function findGitRoot(cb?: (current: string) => boolean | undefined): string;
/**
 * Retrieve info for the repository.  This will walk up from the current working directory
 * until it finds the git root and then prepare loaders for various monorepo config files
 */
export declare function repoInfo(): RepoInfo;
//# sourceMappingURL=repoInfo.d.ts.map