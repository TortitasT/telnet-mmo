const Server = require('./server')
const Database = require('./database.js')
const AdminDisplay = require('./adminDisplay.js')

Server.start()
Database.load()
AdminDisplay.refreshServerScreen()
