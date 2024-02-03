import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import { InvalidInputError } from '../utils/invalid-input-error.js'
import { pathResolver } from '../utils/path-resolver.js'

const calculateHash = async ({ cwd }, ...args) => {
  if (args.length !== 1) {
    console.log('invalid number of arguments', args)
    throw new InvalidInputError('invalid number of arguments')
  }

  const pathToFile = pathResolver(cwd, ...args)
  const rs = createReadStream(pathToFile)
  let hash

  const hashTs = new Transform({
    transform(chunk, _, callback) {
      const hashDigest = createHash('sha256').update(chunk).digest('hex')
      hash = hashDigest
      this.push(hashDigest)
      callback()
    },
  })

  await pipeline(rs, hashTs)

  return hash
}

export const hash = {
  getCommandsList: () => ({
    hash: async (...args) => await calculateHash(...args),
  }),
}
