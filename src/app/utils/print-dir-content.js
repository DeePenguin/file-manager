import { readdir } from 'node:fs/promises'

const getEntityType = entity => {
  if (entity.isDirectory()) {
    return 'directory'
  }
  if (entity.isFile()) {
    return 'file'
  }
  if (entity.isSymbolicLink()) {
    return 'link'
  }
  if (entity.isBlockDevice()) {
    return 'block'
  }
  if (entity.isSocket()) {
    return 'socket'
  }
  if (entity.isFIFO()) {
    return 'pipe'
  }
  if (entity.isCharacterDevice()) {
    return 'char'
  }
  return ''
}

const typesSortOrder = {
  directory: 0,
  file: 1,
  link: 2,
  block: 3,
  socket: 4,
  pipe: 5,
  char: 6,
}

export const printDirContent = async dirPath => {
  try {
    const dirContent = await readdir(dirPath, { withFileTypes: true })
    const tabularData = Object.entries(
      dirContent
        .map(entity => ({
          name: entity.name,
          type: getEntityType(entity),
        }))
        .reduce((acc, entity) => {
          acc[entity.type] = acc[entity.type] ? [...acc[entity.type], entity] : [entity]
          return acc
        }, {}),
    )
      .sort((a, b) => typesSortOrder[a[0]] - typesSortOrder[b[0]])
      .flatMap(([, entities]) => entities.sort())

    console.table(tabularData)
  } catch (error) {
    throw new Error('Operation failed')
  }
}
