import { getWorkspacesInfoSync } from '@rnx-kit/tools-workspaces';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

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
  private _files: Record<string, boolean> = {};

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

  hasFile(...parts: string[]): boolean {
    let filePath = path.join(...parts);
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(this.root, filePath);
    }
    return (this._files[filePath] ??= fs.existsSync(filePath));
  }

  pathTo(from: string, to: string): string {
    if (!path.isAbsolute(from)) {
      from = path.join(this.root, from);
    }
    if (!path.isAbsolute(to)) {
      to = path.join(this.root, to);
    }
    return path.relative(from, to).replace(/\\/g, '/');
  }

  /**
   * Check if a folder is a workspace
   */
  isWorkspace(packageRoot: string): boolean {
    return this._info.isWorkspace(packageRoot);
  }
}
