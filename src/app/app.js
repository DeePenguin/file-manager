import { createInterface } from 'node:readline/promises'

import { startFlags } from './constants/flags.js'
import { gatherSystemInfo, os } from './modules/os.js'
import { InvalidInputError } from './utils/invalid-input-error.js'

const { stdin: input, stdout: output } = process

const defaultUserName = 'Username'

export class App {
  #workingDir
  #eol
  #username = ''
  #io = createInterface({ input, output, prompt: '>> ' })
  #commands = {
    '.exit': () => this.#exit(),
  }
  #modules = {
    os,
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
    this.#gatherSystemInfo()
    const commandList = Object.values(this.#modules).map(module => module.getCommandsList())
    Object.assign(this.#commands, ...commandList)
  }

  #gatherSystemInfo() {
    const { homedir, eol } = gatherSystemInfo()
    this.#workingDir = homedir
    this.#eol = eol
  }

  #getUserName() {
    const usernameArgIndex = process.argv.findIndex(arg => arg === startFlags.username) + 1
    this.#username = (usernameArgIndex && process.argv[usernameArgIndex]) || defaultUserName
  }

  #showGreeting() {
    this.#getUserName()
    if (this.#username === defaultUserName) {
      console.log(
        `Please specify your username with the --username argument.${this.#eol}Example: npm run start -- --username=your_username`,
      )
    }
    console.log(`Welcome to the File Manager, ${this.#username}!`)
  }

  #showGoodbye() {
    console.log(`${this.#eol}Thank you for using File Manager, ${this.#username}, goodbye!`)
  }

  #showInvalidInputMessage() {
    console.log('Invalid input')
  }

  #showOperationFailedMessage() {
    console.log('Operation failed')
  }

  #showWorkingDir() {
    console.log(`You are currently in ${this.#workingDir}`)
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
      const [command, ...args] = input.trim().split(' ')
      const commandHandler = this.#commands[command] || null
      if (!commandHandler) {
        throw new InvalidInputError()
      }
      const operationResult = await commandHandler(args)
      if (operationResult) {
        console.log(operationResult)
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
