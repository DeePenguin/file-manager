import { mkdir } from 'node:fs/promises'
import { dirname, format, parse } from 'node:path'

export const recursiveSuffixMkdir = async path => {
  try {
    await mkdir(path)
    return path
  } catch (e) {
    if (e.code === 'EEXIST') {
      const { root, dir, base } = parse(e.path)
      const config = { root, dir, base: `${base}-copy` }
      return recursiveSuffixMkdir(format(config))
    }
    if (e.code === 'ENOENT') {
      await recursiveSuffixMkdir(dirname(path))
      await mkdir(path)
      return path
    }
    throw e
  }
}
