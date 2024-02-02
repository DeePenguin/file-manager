import { normalize, resolve } from 'node:path'

export const pathResolver = (cwd, ...segments) => {
  const sanitizedSegments = segments.map(segment => segment.replace(/^("|')|("|')$/g, '').replace(/(\\\s)/g, ' '))
  const path = resolve(cwd, normalize(sanitizedSegments.join('')))
  return path
}
