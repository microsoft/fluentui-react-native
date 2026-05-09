const { defineConfig } = require('@yarnpkg/types');
const { constrain } = require('./scripts/src/index.ts');

module.exports = defineConfig({
  constraints: async ({ Yarn }) => {
    for (const workspace of Yarn.workspaces()) {
      if (workspace.cwd !== '.') {
        constrain(workspace);
      }
    }
  },
});
