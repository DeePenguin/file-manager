const reset = '\x1b[0m'
const red = '\x1b[31m'
const green = '\x1b[32m'
const yellow = '\x1b[33m'
const blue = '\x1b[34m'
const grey = '\x1b[90m'
const magenta = '\x1b[35m'

const icons = {
  error: '\u274c',
  info: '\u2139',
  warn: '\u26a0',
  log: '\u00ab',
  success: '\u2713',
  hint: '\u1367',
}

export const logger = {
  error: (...args) => console.log(red, icons.error, ...args, reset),
  info: (...args) => console.log(blue, icons.info, ...args, reset),
  success: (...args) => console.log(green, icons.success, ...args, reset),
  warn: (...args) => console.log(yellow, icons.warn, ...args, reset),
  log: (...args) => console.log(magenta, icons.log, ...args, reset),
  hint: (...args) => console.log(grey, icons.hint, ...args, reset),
}
