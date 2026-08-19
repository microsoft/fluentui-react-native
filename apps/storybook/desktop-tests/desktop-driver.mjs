/**
 * `desktop-driver` CLI entry for this workspace.
 *
 * The package declares WebdriverIO as an optional peer dependency, which makes Yarn virtualize
 * the workspace. The pnpm linker does not materialize a virtualized workspace's `bin`, so the CLI
 * is invoked through its module entry instead of a `.bin` shim. Behaviour is identical.
 */
import { main } from '@fluentui-react-native/desktop-driver/cli';

process.exitCode = await main(process.argv.slice(2));
