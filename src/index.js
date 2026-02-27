import { Command } from 'commander'
import chalk from 'chalk'
import { install, uninstall } from './installer.js'
import { readConfig, writeConfig } from './hooks.js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const VALID_MODES = ['aggressive', 'balanced', 'subtle']

function ghostPrint(msg) {
  process.stdout.write(chalk.gray('👻 ') + chalk.dim(msg) + '\n')
}

export function run() {
  const program = new Command()

  program
    .name('ghost-mode')
    .description('Invisible AI pair programmer for Claude Code')
    .version('1.0.0')

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
      const settingsPath = join(process.cwd(), '.claude', 'settings.json')
      if (!existsSync(settingsPath)) {
        console.log(chalk.dim('\n  Ghost Mode: not installed\n'))
        return
      }
      try {
        const settings = JSON.parse(readFileSync(settingsPath, 'utf8'))
        const hooks = settings.hooks || {}
        const hasGhost = Object.values(hooks).some(
          (arr) => Array.isArray(arr) && arr.some((h) => h.matcher === 'ghost-mode')
        )
        if (hasGhost) {
          const cfg = readConfig()
          console.log(chalk.gray('\n  Ghost Mode: active'))
          console.log(chalk.dim(`  Sensitivity: ${cfg.mode || 'balanced'}\n`))
        } else {
          console.log(chalk.dim('\n  Ghost Mode: not installed\n'))
        }
      } catch {
        console.log(chalk.dim('\n  Ghost Mode: unknown (could not parse settings)\n'))
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
