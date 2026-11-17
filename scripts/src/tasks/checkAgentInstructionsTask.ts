import { Command, Option } from 'clipanion';
import { findGitRoot } from 'workspace-tools';

import { checkAgentInstructions } from './agentInstructions.ts';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createSkillDistribution, SKILL_EXPORTS } from '../utils/skillDistribution.ts';

export class CheckAgentInstructionsCommand extends Command {
  static override paths = [['check-agent-instructions']];

  static override usage = Command.Usage({
    description: 'Check the integrity of agent instructions, skills, package references, and evaluation cases',
    details:
      'Validates reference frontmatter, links and anchors, code-span paths, skill metadata, package guidance, rule IDs, indexes, and evaluation fixtures. See references/agents/README.md.',
    examples: [['Check agent instructions', '$0 check-agent-instructions']],
  });

  verbose = Option.Boolean('--verbose', false, {
    description: 'Report instruction sizes and public skill metadata/body/shared-reference budgets',
  });

  async execute() {
    const root = findGitRoot(process.cwd());
    const { issues, report } = checkAgentInstructions(root);
    if (existsSync(path.join(root, SKILL_EXPORTS))) {
      try {
        const distribution = createSkillDistribution(root);
        if (this.verbose) {
          for (const entry of distribution.metrics) {
            console.log(
              `${entry.name}: ${entry.descriptionCharacters} description characters, ${entry.bodyBytes} body bytes, ${entry.directReferenceBytes} direct shared-reference/prerequisite bytes (not tokens; package reads excluded)`,
            );
          }
          console.log(
            `Exported description total: ${distribution.metrics.reduce((total, entry) => total + entry.descriptionCharacters, 0)} characters`,
          );
        }
      } catch (error) {
        issues.push({ file: SKILL_EXPORTS, message: error instanceof Error ? error.message : String(error) });
      }
    }
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
