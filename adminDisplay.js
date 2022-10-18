const Config = require('./config.js')
const Database = require('./database.js')

const chalk = require('chalk')

class AdminDisplay {
  static lastMessage = ''

  static refreshServerScreen() {
    console.clear()
    console.log(chalk.green(`Server running on port ${Config.port}`))
    console.log(
      chalk.green('Connected users: ' + Database.connectedUsers.length)
    )
    console.table(Database.connectedUsers, [
      'id',
      'username',
      'position.x',
      'position.y',
    ])
    console.table(Database.map.tiles)
    console.log(this.lastMessage)
  }

  static ShowMessage(message) {
    this.lastMessage = message
  }
}

module.exports = AdminDisplay
