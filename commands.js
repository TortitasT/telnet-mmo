const chalk = require('chalk')

const User = require('./user.js')
const Database = require('./database.js')
const Config = require('./config.js')
const AdminDisplay = require('./adminDisplay.js')

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

    case 'spawn':
      Database.map.spawnUser(user)
      break

    case 'move':
      const direction = userInput[1]

      let desiredPosition = {...user.position}

      switch (direction) {
        case 'up':
          desiredPosition.y++
          if (
            Database.map.getTile(desiredPosition) === null ||
            Database.map.getTile(desiredPosition).actorId !== null
          ) {
            user.write(chalk.red('You cannot move there!'))
            desiredPosition = user.position
          }
          break
        case 'down':
          desiredPosition.y--
          if (
            Database.map.getTile(desiredPosition) === null ||
            Database.map.getTile(desiredPosition).actorId !== null
          ) {
            user.write(chalk.red('You cannot move there!'))
            desiredPosition = user.position
          }
          break
        case 'left':
          desiredPosition.x--
          if (
            Database.map.getTile(desiredPosition) === null ||
            Database.map.getTile(desiredPosition).actorId !== null
          ) {
            user.write(chalk.red('You cannot move there!'))
            desiredPosition = user.position
          }
          break
        case 'right':
          desiredPosition.x++
          if (
            Database.map.getTile(desiredPosition) === null ||
            Database.map.getTile(desiredPosition).actorId !== null
          ) {
            user.write(chalk.red('You cannot move there!'))
            desiredPosition = user.position
          }
          break
      }

      const check1 = Database.map.setActorId(user.position, null)
      const check2 = Database.map.setActorId(desiredPosition, user.id)
      require('./log.js')('MOVEMENT FROM ' + JSON.stringify(user.position) + ' TO ' + JSON.stringify(desiredPosition) + ' CHECKS ' + check1 + ' ' + check2)
      
      if (check1 && check2) {
        user.position = desiredPosition
      }
      user.write(chalk.green('You moved to ' + user.position))

      break

    case 'coordinates':
      if (!user.position) {
        user.write(chalk.red('You are not spawned yet!'))
        break
      }

      user.writeWithPrompt(
        chalk.blue(`x: ${user.position.x} y: ${user.position.y}`)
      )
      break

    case 'map':
      let map = ''
      for (let y = 0; y < Database.map.tiles[0].length; y++) {
        for (let x = 0; x < Database.map.tiles.length; x++) {
          const tile = Database.map.getTile({ x, y, z: 0 })
          if (tile.actorId === null) {
            map += chalk.green(tile.type[0])
          } else {
            map += chalk.red('X')
          }
        }
        map += '\n'
      }
      user.writeWithPrompt(map)
      break

    case 'users':
      user.write(chalk.cyan('Connected users:\n'))
      Database.connectedUsers.forEach((databaseUser) => {
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
        Database.users.find(
          (databaseUser) => databaseUser.username === user.username
        )
      ) {
        user.write(chalk.red('Username already taken'))
        break
      }

      Database.users.push({
        username: user.username,
        password: user.password,
      })

      Database.save()

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

      const userToLogin = Database.users.find(
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
      const destination = Database.connectedUsers.find(
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

module.exports = handleUserInput