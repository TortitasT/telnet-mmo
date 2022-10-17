const net = require('node:net')
const chalk = require('chalk')
const crypto = require('node:crypto')
const fs = require('fs')
require('dotenv').config()

const User = require('./user.js')

class Tile {
  x
  y
  type
  constructor(x, y, type) {
    this.x = x
    this.y = y
    this.type = type
  }
}

class Map {
  tiles = []
  constructor(sizeX, sizeY) {
    for (let x = 0; x < sizeX; x++) {
      let column = []
      for (let y = 0; y < sizeY; y++) {
        column.push(new Tile(x, y, 'grass'))
      }
      this.tiles.push(column)
    }
  }
}

function serverListener(connection) {
  const user = new User(connection)
  database.connectedUsers.push(user)

  refreshServerScreen()
  console.log(chalk.green('connected'))

  user.writeWithPrompt(chalk.green('Welcome to the server!'))

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
      user.write('\n'.repeat(40))
      break

    case 'ping':
      user.write(chalk.blue('pong'))
      break

    case 'users':
      user.write(chalk.cyan('Connected users:\n'))
      database.connectedUsers.forEach((databaseUser) => {
        user.write(`${databaseUser.username || 'Guest'}` + '\n')
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
          user.write(chalk.red('Invalid command'))
          break
      }
      break

    case 'register':
      if (user.isGuest) {
        user.write(chalk.red('You must set a username first'))
        break
      }

      if (user.password === null) {
        user.write(chalk.red('You must set a password first'))
        break
      }

      if (
        database.users.find(
          (databaseUser) => databaseUser.username === user.username
        )
      ) {
        user.write(chalk.red('Username already taken'))
        break
      }

      database.users.push({
        username: user.username,
        password: user.password,
      })

      database.save()

      user.write(chalk.green('User registered'))
      break

    case 'login':
      if (userInput.length < 3) {
        user.write(chalk.red('Invalid parameters:\nlogin username password'))
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
        user.write(chalk.red('Invalid username or password'))
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
        user.write(chalk.red('User not found'))
      }
      break

    default:
      user.write(chalk.red('Command not found: ') + userInput[0])
      break
  }
  user.writeWithPrompt('')
}

function refreshServerScreen() {
  console.clear()
  console.log(chalk.green(`Server running on port ${port}`))
  console.log(chalk.green('Connected users: ' + database.connectedUsers.length))
  console.table(database.connectedUsers, ['id', 'username', 'isGuest'])
  console.table(database.map.tiles)
}

function writeMapIntoJson(map){
  const json = JSON.stringify(map)
  fs.writeFile('mapDump.json', json, 'utf8', function (err) {
    console.log('The file was saved!');
  });
}

const port = process.env.PORT || 8080

const databaseFolder = './database'
if (!fs.existsSync(databaseFolder)) {
  fs.mkdirSync(databaseFolder)
}

let database = {
  connectedUsers: [],
  users: [],
  map: [],
  load() {
    try {
      database.map = require(databaseFolder + '/map.json')
    } catch (error) {
      console.log(chalk.red('Map not found'))
      database.map = new Map(10, 10)
    }
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
      fs.writeFileSync(
        databaseFolder + '/map.json',
        JSON.stringify(database.map)
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

