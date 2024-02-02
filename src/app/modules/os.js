import { arch, cpus, EOL, homedir, userInfo } from 'node:os'

import { InvalidInputError } from '../utils/invalid-input-error.js'

const commands = {
  '--EOL': () => EOL,
  '--homedir': () => homedir(),
  '--cpus': () => getCpus(),
  '--username': () => userInfo().username,
  '--architecture': () => arch(),
}

const getCpus = () => {
  const cpusInfo = cpus().map(cpu => cpu.model)
  return {
    amount: cpusInfo.length,
    cpus: cpusInfo,
  }
}

const commandHandler = args => {
  const command = args[0]
  if (!args?.length || !commands[command]) {
    throw new InvalidInputError('no flag provided')
  }
  const result = commands[command]()
  return result
}

export const gatherSystemInfo = () => ({
  homedir: homedir(),
  eol: EOL,
})

export const os = {
  getCommandsList: () => ({
    os: args => commandHandler(args),
  }),
}
