import { stat } from 'node:fs/promises'
import { resolve } from 'node:path'

import { InvalidInputError } from '../utils/invalid-input-error.js'
import { pathResolver } from '../utils/path-resolver.js'
import { printDirContent } from '../utils/print-dir-content.js'

const state = {
  cwd: '',
}

const resolveCwd = async args => {
  if (args.length !== 1) {
    throw new InvalidInputError('invalid number of arguments')
  }
  const path = pathResolver(state.cwd, ...args)
  const pathStat = await stat(path)
  const isDir = pathStat.isDirectory()
  if (!isDir) {
    throw new Error('not a directory')
  }
  state.cwd = path
}

export const navigation = {
  getCommandsList: () => ({
    up: () => {
      state.cwd = resolve(state.cwd, '..')
    },
    cd: async (_, ...args) => await resolveCwd(args),
    ls: async () => await printDirContent(state.cwd),
  }),
  init: cwd => {
    state.cwd = cwd
    return state
  },
}
