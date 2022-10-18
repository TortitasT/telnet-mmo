const fs = require('fs')
const chalk = require('chalk')
const { Map } = require('./map.js')

const databaseFolder = './database'
if (!fs.existsSync(databaseFolder)) {
  fs.mkdirSync(databaseFolder)
}

class Database {
  static connectedUsers = []
  static users = []
  static map = []

  static load() {
    try {
      Database.map = new Map(
        JSON.parse(fs.readFileSync(databaseFolder + '/map.json'))
      )
    } catch (error) {
      console.log(chalk.red('Map not found, generating new map...'))
      Database.map = new Map().generate(10, 10)
    }
    try {
      require(databaseFolder + '/users.json').forEach((user) => {
        Database.users.push(user)
      })
    } catch (error) {
      console.error(chalk.red('Users database not found'))
    }
  }

  static save() {
    try {
      fs.writeFileSync(
        databaseFolder + '/users.json',
        JSON.stringify(Database.users)
      )
      fs.writeFileSync(
        databaseFolder + '/map.json',
        JSON.stringify(Database.map)
      )
    } catch (error) {
      console.error(chalk.red('Could not save users database'))
    }
  }

  static saveUser(user) {
    const userIndex = Database.users.findIndex(
      (databaseUser) => databaseUser.id === user.id
    )
    if (userIndex === -1) {
      Database.users.push(user)
    } else {
      Database.users[userIndex] = user
    }
    Database.save()
  }
}

module.exports = Database
