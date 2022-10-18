const crypto = require('node:crypto')

class User {
  connection
  id
  isGuest
  username
  password
  position = { x: null, y: null, z: null }

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
    this.connection.write(
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

  hasSpawned() {
    return this.position.x !== null && this.position.y !== null
  }
}

module.exports = User
