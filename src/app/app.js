import { createInterface } from 'node:readline/promises'

import { cliArgsRegex } from './constants/cli-args-regex.js'
import { startFlags } from './constants/flags.js'
import { hash } from './modules/hash.js'
import { navigation } from './modules/navigation.js'
import { gatherSystemInfo, os } from './modules/os.js'
import { InvalidInputError } from './utils/invalid-input-error.js'
import { logger } from './utils/logger.js'

const { stdin: input, stdout: output } = process

const defaultUserName = 'Username'

export class App {
  #nav = {}
  #os = {}
  #username = ''
  #io = createInterface({ input, output, prompt: '\u00bb' })
  #commands = {
    '.exit': () => this.#exit(),
  }
  #modules = {
    os,
    navigation,
    hash,
  }

  run() {
    this.#configure()
    this.#showGreeting()
    this.#showWorkingDir()
    this.#listenInput()

    process.on('exit', () => {
      this.#io.close()
      this.#showGoodbye()
    })
  }

  #configure() {
    this.#os = gatherSystemInfo()
    this.#nav = this.#modules.navigation.init(this.#os.homedir)
    const commandList = Object.values(this.#modules).map(module => module.getCommandsList())
    Object.assign(this.#commands, ...commandList)
  }

  #getUserName() {
    const usernameArgIndex = process.argv.findIndex(arg => arg === startFlags.username) + 1
    this.#username = (usernameArgIndex && process.argv[usernameArgIndex]) || defaultUserName
  }

  #showGreeting() {
    this.#getUserName()
    if (this.#username === defaultUserName) {
      logger.hint(
        `\tPlease specify your username with the --username argument.${this.#os.eol}\tExample: npm run start -- --username=your_username`,
      )
    }
    logger.success(`Welcome to the File Manager, ${this.#username}!`)
  }

  #showGoodbye() {
    logger.success(`${this.#os.eol}Thank you for using File Manager, ${this.#username}, goodbye!`)
  }

  #showInvalidInputMessage() {
    logger.error('Invalid input')
  }

  #showOperationFailedMessage() {
    logger.error('Operation failed')
  }

  #showWorkingDir() {
    logger.info(`You are currently in ${this.#nav.cwd}`)
  }

  #listenInput() {
    this.#io.prompt()
    this.#io.on('line', async input => {
      await this.#handleInput(input)
      this.#io.prompt()
    })
  }

  async #handleInput(input) {
    try {
      const [command, ...args] = input.match(cliArgsRegex)
      const commandHandler = this.#commands[command]
      if (!commandHandler) {
        throw new InvalidInputError()
      }
      const operationResult = await commandHandler({ cwd: this.#nav.cwd, eol: this.#os.eol }, ...args)
      if (operationResult) {
        logger.log(operationResult)
      }
    } catch (error) {
      if (error instanceof InvalidInputError) {
        this.#showInvalidInputMessage()
      } else {
        this.#showOperationFailedMessage()
      }
    } finally {
      this.#showWorkingDir()
    }
  }

  #exit() {
    process.exit()
  }
}
