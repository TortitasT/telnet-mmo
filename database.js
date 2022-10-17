const fs = require('fs');
const chalk = require('chalk');
const { Map } = require('./map.js');

const databaseFolder = './database'
if (!fs.existsSync(databaseFolder)) {
  fs.mkdirSync(databaseFolder)
}

class Database{
  static connectedUsers = []
  static users = []
  static map = []

  static load() {
    try {
      Database.map = require(databaseFolder + '/map.json')
    } catch (error) {
      console.log(chalk.red('Map not found'))
      Database.map = new Map(10, 10)
    }
    try {
      Database.users = require(databaseFolder + '/users.json')
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
}

module.exports = Database