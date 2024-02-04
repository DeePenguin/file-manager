import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import { InvalidInputError } from '../utils/invalid-input-error.js'
import { pathResolver } from '../utils/path-resolver.js'
import { wsToLogger } from '../utils/ws-to-logger.js'

const createHashStream = () =>
  new Transform({
    transform(chunk, _, callback) {
      const hashDigest = createHash('sha256').update(chunk).digest('hex')
      this.push(hashDigest)
      callback()
    },
  })

const calculateHash = async ({ cwd }, ...args) => {
  if (args.length !== 1) {
    throw new InvalidInputError('invalid number of arguments')
  }

  const pathToFile = pathResolver(cwd, ...args)
  const rs = createReadStream(pathToFile)

  await pipeline(rs, createHashStream(), wsToLogger())
}

export const hash = {
  getCommandsList: () => ({
    hash: async (...args) => await calculateHash(...args),
  }),
}
