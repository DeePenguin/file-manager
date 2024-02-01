import { startFlags } from './constants/flags.js'

const defaultUserName = 'Username'

export class App {
  username

  run() {
    this.showGreeting()
  }

  getUserName() {
    const usernameArgIndex = process.argv.findIndex(arg => arg === startFlags.username) + 1
    this.username = (usernameArgIndex && process.argv[usernameArgIndex]) || defaultUserName
  }

  showGreeting() {
    this.getUserName()
    if (this.username === defaultUserName) {
      console.log(
        'Please specify your username with the --username argument.\nExample: npm run start -- --username=your_username',
      )
    }
    console.log(`Welcome to the File Manager, ${this.username}!`)
  }
}
