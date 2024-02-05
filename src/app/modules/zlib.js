import { createReadStream, createWriteStream } from 'node:fs'
import { join, parse } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createBrotliCompress, createBrotliDecompress } from 'node:zlib'

import { InvalidInputError } from '../utils/invalid-input-error.js'
import { pathResolver } from '../utils/path-resolver.js'

const resolvePaths = (cwd, source, destination) => {
  if (!source || !destination) {
    throw new InvalidInputError('invalid number of arguments')
  }

  const sourcePath = pathResolver(cwd, source)
  const destinationPath = pathResolver(cwd, destination)

  return { sourcePath, destinationPath }
}

const createStreams = (sourcePath, destinationPath) => {
  const rs = createReadStream(sourcePath)
  const ws = createWriteStream(destinationPath)

  return { rs, ws }
}

const compress = async ({ cwd }, source, destination) => {
  const { sourcePath, destinationPath } = resolvePaths(cwd, source, destination)
  const { base } = parse(sourcePath)
  const { rs, ws } = createStreams(sourcePath, join(destinationPath, `${base}.br`))

  await pipeline(rs, createBrotliCompress(), ws)

  return 'Compressed'
}

const decompress = async ({ cwd }, source, destination) => {
  const { sourcePath, destinationPath } = resolvePaths(cwd, source, destination)
  const { name } = parse(sourcePath)
  const { rs, ws } = createStreams(sourcePath, join(destinationPath, name))

  await pipeline(rs, createBrotliDecompress(), ws)

  return 'Decompressed'
}

export const zlib = {
  getCommandsList: () => ({
    compress,
    decompress,
  }),
}
