const { defineConfig } = require('@yarnpkg/types');
const { constrain, constrainRoot } = require('./scripts/src/index.ts');

module.exports = defineConfig({
  constraints: async ({ Yarn }) => {
    let rootWorkspace = null;
    for (const workspace of Yarn.workspaces()) {
      // skip the root workspace, as it should be be evaluated as a standard package
      if (workspace.cwd !== '.') {
        // call through to the scripts constrain implementation that will do validation of each workspace one by one
        constrain(workspace);
      } else {
        rootWorkspace = workspace;
      }
    }
    if (rootWorkspace) {
      constrainRoot(rootWorkspace);
    }
  },
});
