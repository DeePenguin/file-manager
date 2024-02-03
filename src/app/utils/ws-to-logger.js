import { Writable } from 'node:stream'

import { logger } from './logger.js'

export const wsToLogger = () =>
  new Writable({
    write(chunk, _, callback) {
      const result = chunk.toString()
      logger.log(result)
      callback()
    },
  })
