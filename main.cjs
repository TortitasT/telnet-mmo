const net = require('node:net')
const chalk = require('chalk')
const crypto = require('node:crypto')
const fs = require('fs')
require('dotenv').config()

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

  write(message) {
    this.connection.write(message + `\n${this.username || 'guest'}>`)
  }
}

function serverListener(connection) {
  const user = new User(connection)
  database.connectedUsers.push(user)

  refreshServerScreen()
  console.log(chalk.green('connected'))

  user.write(chalk.green('Welcome to the server!'))

  connection.on('data', function (data) {
    console.log(chalk.blue('data: ' + data))

    const userInput = data
      .toString()
      .replace(/[\r\n]/gm, '')
      .split(' ')
    handleUserInput(user, userInput)

    refreshServerScreen()
  })

  connection.on('close', function () {
    database.connectedUsers.splice(database.connectedUsers.indexOf(user), 1)

    refreshServerScreen()
    console.log(chalk.red('disconnected'))
  })
}

function handleUserInput(user, userInput) {
  switch (userInput[0]) {
    case 'close':
    case 'exit':
      user.connection.destroy()
      break

    case 'clear':
      user.connection.write('\n'.repeat(40))
      break

    case 'ping':
      user.connection.write(chalk.blue('pong'))
      break

    case 'users':
      user.connection.write(chalk.cyan('Connected users:\n'))
      database.connectedUsers.forEach((databaseUser) => {
        user.connection.write(`${databaseUser.username || 'Guest'}` + '\n')
      })
      break

    case 'set':
      switch (userInput[1]) {
        case 'username':
          user.username = userInput[2]
          user.isGuest = false
          break

        case 'password':
          const encryptedPassword = crypto.createHash('sha256')
          encryptedPassword.update(userInput[2])
          user.password = encryptedPassword.digest('hex')
          break

        default:
          user.connection.write(chalk.red('Invalid command'))
          break
      }
      break

    case 'register':
      if (user.isGuest) {
        user.connection.write(chalk.red('You must set a username first'))
        break
      }

      if (user.password === null) {
        user.connection.write(chalk.red('You must set a password first'))
        break
      }

      if (
        database.users.find(
          (databaseUser) => databaseUser.username === user.username
        )
      ) {
        user.connection.write(chalk.red('Username already taken'))
        break
      }

      database.users.push({
        username: user.username,
        password: user.password,
      })

      database.save()

      user.connection.write(chalk.green('User registered'))
      break

    case 'login':
      if (userInput.length < 3) {
        user.connection.write(chalk.red('Invalid command'))
        break
      }

      const encryptedPassword = crypto.createHash('sha256')
      encryptedPassword.update(userInput[2])
      const encryptedPasswordString = encryptedPassword.digest('hex')

      const userToLogin = database.users.find(
        (databaseUser) =>
          databaseUser.username === userInput[1] &&
          databaseUser.password === encryptedPasswordString
      )

      if (userToLogin) {
        user.username = userToLogin.username
        user.password = userToLogin.password
        user.isGuest = false
      } else {
        user.connection.write(chalk.red('Invalid username or password'))
      }
      break

    case 'whisper':
      const destination = database.connectedUsers.find(
        (user) => user.username === userInput[1]
      )
      const message = userInput.slice(2).join(' ')

      if (destination) {
        user.whisper(destination, message)
      } else {
        user.connection.write(chalk.red('User not found'))
      }
      break

    default:
      user.connection.write(chalk.red('command not found: ') + userInput[0])
      break
  }
  user.write('')
}

function refreshServerScreen() {
  console.clear()
  console.log(chalk.green(`Server running on port ${port}`))
  console.log(chalk.green('Connected users: ' + database.connectedUsers.length))
  console.table(database.connectedUsers, ['id', 'username', 'isGuest'])
}

const port = process.env.PORT || 8080

const databaseFolder = './database'
if (!fs.existsSync(databaseFolder)) {
  fs.mkdirSync(databaseFolder)
}

let database = {
  connectedUsers: [],
  users: [],
  load() {
    try {
      database.users = require(databaseFolder + '/users.json')
    } catch (error) {
      console.error(chalk.red('Users database not found'))
    }
  },
  save() {
    try {
      fs.writeFileSync(
        databaseFolder + '/users.json',
        JSON.stringify(database.users)
      )
    } catch (error) {
      console.error(chalk.red('Could not save users database'))
    }
  },
}

database.load()

const server = net.createServer(serverListener)
server.listen(port)

refreshServerScreen()
