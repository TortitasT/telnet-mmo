const chalk = require('chalk')

const Database = require('./database.js')

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
      if (!user.hasSpawned()) {
        user.write(chalk.red('You must spawn first'))
        break
      }

      const direction = userInput[1]

      let desiredPosition = { ...user.position }

      switch (direction) {
        case 'up':
          desiredPosition.y++
          if (
            Database.map.getTile(desiredPosition) === null ||
            Database.map.getTile(desiredPosition).actorId !== null
          ) {
            user.write(chalk.red('You cannot move there!'))
            desiredPosition = null
          }
          break
        case 'down':
          desiredPosition.y--
          if (
            Database.map.getTile(desiredPosition) === null ||
            Database.map.getTile(desiredPosition).actorId !== null
          ) {
            user.write(chalk.red('You cannot move there!'))
            desiredPosition = null
          }
          break
        case 'left':
          desiredPosition.x--
          if (
            Database.map.getTile(desiredPosition) === null ||
            Database.map.getTile(desiredPosition).actorId !== null
          ) {
            user.write(chalk.red('You cannot move there!'))
            desiredPosition = null
          }
          break
        case 'right':
          desiredPosition.x++
          if (
            Database.map.getTile(desiredPosition) === null ||
            Database.map.getTile(desiredPosition).actorId !== null
          ) {
            user.write(chalk.red('You cannot move there!'))
            desiredPosition = null
          }
          break
        default:
          user.write(chalk.red('Invalid direction'))
          desiredPosition = null
          break
      }

      if (!desiredPosition) {
        break
      }

      Database.map.setActorId(user.position, null)
      Database.map.setActorId(desiredPosition, user.id)

      user.position = desiredPosition

      user.write(chalk.green(`You moved to ${JSON.stringify(desiredPosition)}`))
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
      if (!user.hasSpawned()) {
        user.write(chalk.red('You must spawn first'))
        break
      }

      const map = Database.map.getDisplayInCoordinates(user.position)
      user.write(map)
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
