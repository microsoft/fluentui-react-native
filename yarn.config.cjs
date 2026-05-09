const { defineConfig } = require('@yarnpkg/types');
const { repoContext, constrain } = require('./scripts/src/index.ts');

module.exports = defineConfig({
  constraints: async ({ Yarn }) => {
    const fix = Yarn.fix;
    for (const workspace of Yarn.workspaces()) {
      constrain(workspace);
    }
  },
});
