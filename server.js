const net = require('node:net')
const chalk = require('chalk')

const User = require('./user.js')
const Database = require('./database.js')
const Config = require('./config.js')
const AdminDisplay = require('./adminDisplay.js')

function serverListener(connection) {
  const user = new User(connection)
  Database.connectedUsers.push(user)

  AdminDisplay.ShowMessage('Connected')
  AdminDisplay.refreshServerScreen()

  user.writeWithPrompt(chalk.green('Welcome to the server!'))

  connection.on('data', function (data) {
    AdminDisplay.ShowMessage(chalk.blue('Received data: ' + data))

    const userInput = data
      .toString()
      .replace(/[\r\n]/gm, '')
      .split(' ')

    require('./commands.js')(user, userInput)

    AdminDisplay.refreshServerScreen()
  })

  connection.on('close', function () {
    Database.connectedUsers.splice(Database.connectedUsers.indexOf(user), 1)

    AdminDisplay.ShowMessage(chalk.red('Disconnected'))
    AdminDisplay.refreshServerScreen()
  })
}

class Server {
  static server

  static start() {
    this.server = net.createServer(serverListener)
    this.server.listen(Config.port)
  }
}

module.exports = Server