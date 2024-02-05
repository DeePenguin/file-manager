import { createReadStream, createWriteStream } from 'node:fs'
import { rename as fsRename, open, readdir, rm, stat } from 'node:fs/promises'
import { format, join, parse } from 'node:path'
import { pipeline } from 'node:stream/promises'

import { InvalidInputError } from '../utils/invalid-input-error.js'
import { pathResolver } from '../utils/path-resolver.js'
import { recursiveSuffixMkdir } from '../utils/recursive-suffix-mkdir.js'
import { wsToLogger } from '../utils/ws-to-logger.js'

const checkArgs = (args, length) => {
  if (args.length !== length) {
    throw new InvalidInputError('invalid number of arguments')
  }
}

const createEmptyFile = async ({ cwd }, ...args) => {
  checkArgs(args, 1)
  const pathToFile = pathResolver(cwd, ...args)
  await (await open(pathToFile, 'wx')).close()

  return 'Created'
}

const read = async ({ cwd }, ...args) => {
  checkArgs(args, 1)
  const pathToFile = pathResolver(cwd, ...args)
  const rs = createReadStream(pathToFile)

  await pipeline(rs, wsToLogger())
}

const remove = async ({ cwd }, ...args) => {
  checkArgs(args, 1)
  const pathToFile = pathResolver(cwd, ...args)

  await rm(pathToFile, { recursive: true, force: true })

  return 'Removed'
}

const rename = async ({ cwd }, ...args) => {
  checkArgs(args, 2)
  const [path, newName] = args
  const pathToFile = pathResolver(cwd, path)
  const newPath = join(parse(pathToFile).dir, parse(newName).base)

  await fsRename(pathToFile, newPath)

  return 'Renamed'
}

const move = async ({ cwd }, ...args) => {
  checkArgs(args, 2)
  const [source, destination] = args
  const sourcePath = pathResolver(cwd, source)
  const destinationPath = pathResolver(cwd, destination)
  const isSourceDir = (await stat(sourcePath)).isDirectory()
  const isDestinationDir = (await stat(destinationPath)).isDirectory()
  if (!isDestinationDir) {
    throw new Error('not a directory')
  }
  if (isSourceDir) {
    await copyDir(sourcePath, join(destinationPath, parse(sourcePath).base))
  } else {
    await copyFile(sourcePath, join(destinationPath, parse(sourcePath).base))
  }

  await rm(sourcePath, { recursive: true, force: true })

  return 'Moved'
}

async function copyDir(sourcePath, destinationPath) {
  const safeDestinationPath = await recursiveSuffixMkdir(destinationPath)
  const sourceContent = await readdir(sourcePath, { withFileTypes: true })
  sourceContent.forEach(async item => {
    const pathToOriginal = join(sourcePath, item.name)
    const pathToCopy = join(safeDestinationPath, item.name)
    if (item.isDirectory()) {
      return await copyDir(pathToOriginal, pathToCopy)
    }
    await copyFile(pathToOriginal, pathToCopy)
  })

  return 'Copied'
}

const copyFile = async (sourcePath, destinationPath) => {
  try {
    const rs = createReadStream(sourcePath)
    const ws = createWriteStream(destinationPath, { flags: 'wx' })

    await pipeline(rs, ws)

    return 'Copied'
  } catch ({ code, path }) {
    if (code === 'EEXIST') {
      const { root, dir, name, ext } = parse(path)
      const config = { root, dir, ext, name: `${name}-copy` }
      const destinationPath = format(config)
      return copyFile(sourcePath, destinationPath)
    }
    throw new Error(code)
  }
}

const copy = async ({ cwd }, ...args) => {
  checkArgs(args, 2)
  const [source, destination] = args
  const sourcePath = pathResolver(cwd, source)
  const destinationPath = pathResolver(cwd, destination)
  const pathStat = await stat(sourcePath)
  const { base } = parse(sourcePath)
  if (pathStat.isDirectory()) {
    return await copyDir(sourcePath, join(destinationPath, base))
  }
  return await copyFile(sourcePath, join(destinationPath, base))
}

export const fs = {
  getCommandsList: () => ({
    cat: async (...args) => await read(...args),
    add: async (...args) => await createEmptyFile(...args),
    rn: async (...args) => await rename(...args),
    cp: async (...args) => await copy(...args),
    mv: async (...args) => await move(...args),
    rm: async (...args) => await remove(...args),
  }),
}
