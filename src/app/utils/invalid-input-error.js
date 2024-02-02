export class InvalidInputError extends Error {
  constructor(message) {
    super(message)
    this.name = 'Invalid Input Error'
  }
}
