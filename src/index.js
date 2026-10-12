import { Command } from 'commander'
import chalk from 'chalk'
import { install, uninstall, isInstalled } from './installer.js'
import { readConfig, writeConfig } from './hooks.js'

const VALID_MODES = ['aggressive', 'balanced', 'subtle']

function ghostPrint(msg) {
  process.stdout.write(chalk.gray('👻 ') + chalk.dim(msg) + '\n')
}

export function run() {
  const program = new Command()

  program
    .name('ghost-mode')
    .description('Non-blocking whisper hooks for Claude Code')
    .version('2.0.0')

  program
    .command('install')
    .description('Install ghost hooks into .claude/settings.json')
    .option('--mode <mode>', 'Sensitivity mode (aggressive|balanced|subtle)', 'balanced')
    .action(async (opts) => {
      const mode = VALID_MODES.includes(opts.mode) ? opts.mode : 'balanced'
      ghostPrint('Installing...')
      try {
        await install(mode)
        console.log(chalk.gray('\n  Ghost Mode is now watching.\n'))
        console.log(chalk.dim('  It will not say a word unless it has something to say.'))
        console.log(chalk.dim(`  Sensitivity: ${mode}\n`))
      } catch (err) {
        console.error(chalk.red('Install failed:'), err.message)
        process.exit(1)
      }
    })

  program
    .command('uninstall')
    .description('Remove ghost hooks from .claude/settings.json')
    .action(async () => {
      try {
        await uninstall()
        console.log(chalk.gray('\n  Ghost Mode removed. Silence.\n'))
      } catch (err) {
        console.error(chalk.red('Uninstall failed:'), err.message)
        process.exit(1)
      }
    })

  program
    .command('status')
    .description('Check if ghost mode is active in current project')
    .action(() => {
      if (isInstalled()) {
        const cfg = readConfig()
        console.log(chalk.gray('\n  Ghost Mode: active'))
        console.log(chalk.dim(`  Sensitivity: ${cfg.mode || 'balanced'}\n`))
      } else {
        console.log(chalk.dim('\n  Ghost Mode: not installed\n'))
      }
    })

  program
    .command('config <mode>')
    .description('Set ghost sensitivity (aggressive|balanced|subtle)')
    .action(async (mode) => {
      if (!VALID_MODES.includes(mode)) {
        console.error(chalk.red(`Invalid mode: ${mode}`))
        console.error(chalk.dim(`Valid modes: ${VALID_MODES.join(', ')}`))
        process.exit(1)
      }
      try {
        writeConfig({ mode })
        await install(mode)
        console.log(chalk.gray(`\n  Ghost sensitivity: ${mode}\n`))
      } catch (err) {
        console.error(chalk.red('Config failed:'), err.message)
        process.exit(1)
      }
    })

  program.parse()
}
