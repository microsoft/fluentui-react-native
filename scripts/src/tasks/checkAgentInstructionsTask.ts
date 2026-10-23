import { Command, Option } from 'clipanion';
import { findGitRoot } from 'workspace-tools';

import { checkAgentInstructions } from './agentInstructions.ts';

export class CheckAgentInstructionsCommand extends Command {
  static override paths = [['check-agent-instructions']];

  static override usage = Command.Usage({
    description: 'Check the integrity of agent instructions, skills, package references, and evaluation cases',
    details:
      'Validates reference frontmatter, links and anchors, code-span paths, skill metadata, package guidance, rule IDs, indexes, and evaluation fixtures. See references/agents/README.md.',
    examples: [['Check agent instructions', '$0 check-agent-instructions']],
  });

  verbose = Option.Boolean('--verbose', false, { description: 'Report always-on, skill, and guided package AGENTS.md sizes' });

  async execute() {
    const root = findGitRoot(process.cwd());
    const { issues, report } = checkAgentInstructions(root);
    if (this.verbose) {
      for (const entry of report) {
        console.log(`${entry.bytes.toString().padStart(7)} bytes  ${entry.file}`);
      }
    }
    for (const issue of issues) {
      console.error(`${issue.file}${issue.line ? `:${issue.line}` : ''}: ${issue.message}`);
    }
    if (issues.length > 0) {
      console.error(`Agent instruction check failed with ${issues.length} issue(s).`);
      return 1;
    }
    console.log('Agent instruction check passed.');
    return 0;
  }
}
