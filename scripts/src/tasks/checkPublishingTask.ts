import { TaskFunction } from 'just-task';

export interface CheckPublishingOptions {
  /**
   * By default this will only check dependencies, to check devDependencies as well set this to true
   */
  devDependencies?: boolean;

  /**
   * Opt in to checking peer dependencies as well
   */
  peerDependencies?: boolean;
}

export function checkPublishingTask(options: CheckPublishingOptions = {}): TaskFunction {
  return function(done: (error?: Error) => void) {
    // get package JSON for the caller based on process.cwd
    // enumerate deps to check
    // require package.json for each
    // check for private bit
  };
}
