function toLog(text) {
  const fs = require('fs')

  const formattedText = `${new Date().getSeconds()} -> ${text}\n`

  fs.appendFile('logs.log', formattedText, (err) => {
    if (err) {
      console.error(err)
    }
  })
}

module.exports = toLog
