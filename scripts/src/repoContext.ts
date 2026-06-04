import { getWorkspacesInfoSync } from '@rnx-kit/tools-workspaces';
import { execSync } from 'node:child_process';

/**
 * Get the cached repo context, which includes the root folder, workspace folders, and catalog.
 */
export const repoContext = (() => {
  let _context: RepoContext | undefined;
  return () => {
    return (_context ??= new RepoContext());
  };
})();

/**
 * Create a repo context that caches the root folder, workspace folders, catalogs, and other information
 * about the repo. Elements are initialized on-demand (except for the root folder)
 */
export class RepoContext {
  private _info = getWorkspacesInfoSync();
  private _root?: string;
  private _workspaceFolders?: string[];
  private _catalog?: Record<string, string>;

  /**
   * Get the root folder for the repo. This is the folder that contains the lockfile
   */
  get root(): string {
    return (this._root ??= this._info.getRoot());
  }

  /**
   * Get the list of workspace directories for the repo.
   */
  get workspaces(): string[] {
    return (this._workspaceFolders ??= this._info.findPackagesSync());
  }

  /**
   * Get the catalog for the repo.
   */
  get catalog(): Record<string, string> {
    if (!this._catalog) {
      const command = 'yarn config get catalog --json';
      const output = execSync(command, { cwd: this.root, encoding: 'utf-8' });
      this._catalog = JSON.parse(output) as Record<string, string>;
    }
    return this._catalog;
  }

  /**
   * Check if a folder is a workspace
   */
  isWorkspace(packageRoot: string): boolean {
    return this._info.isWorkspace(packageRoot);
  }
}
