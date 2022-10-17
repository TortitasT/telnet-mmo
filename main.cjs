const chalk = require('chalk')
const crypto = require('node:crypto')
const fs = require('fs')
require('dotenv').config()

const User = require('./user.js')
const Server = require('./server')
const Database = require('./database.js')
const { Map, Tile } = require('./map.js')
const AdminDisplay = require('./adminDisplay.js')

function writeMapIntoJson(map) {
  const json = JSON.stringify(map)
  fs.writeFile('mapDump.json', json, 'utf8', function (err) {
    console.log('The file was saved!')
  })
}

Server.start()

Database.load()

AdminDisplay.refreshServerScreen()
