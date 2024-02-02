import { stat } from 'node:fs/promises'
import { normalize, resolve } from 'node:path'

import { printDirContent } from '../utils/print-dir-content.js'

const state = {
  cwd: '',
}

const resolveCwd = async args => {
  try {
    const path = resolve(state.cwd, normalize(args.join(' ')))
    const pathStat = await stat(path)
    const isDir = pathStat.isDirectory()
    if (!isDir) {
      throw new Error('not a directory')
    }
    state.cwd = path
  } catch (err) {
    throw new Error('invalid path')
  }
}

export const navigation = {
  getCommandsList: () => ({
    up: () => {
      state.cwd = resolve(state.cwd, '..')
    },
    cd: async args => await resolveCwd(args),
    ls: async () => await printDirContent(state.cwd),
  }),
  init: cwd => {
    state.cwd = cwd
    return state
  },
}
