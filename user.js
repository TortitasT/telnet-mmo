const crypto = require('node:crypto')

class User {
  connection
  id
  isGuest
  username
  password

  constructor(connection) {
    this.connection = connection

    this.id = crypto.randomUUID()
    this.isGuest = true

    this.username = null
    this.password = null
  }

  whisper(destination, message) {
    destination.write(
      chalk.yellowBright(
        `\n[WHISPER] ${this.username} -> ${destination.username}: ${message}\n`
      )
    )
  }

  writeWithPrompt(message) {
    this.connection.write(message + `\n${this.username || 'guest'}>`)
  }

  write(message) {
    this.connection.write(message)
  }
}

module.exports = User