function toLog(text){
  const fs = require('fs');

  const errorText = `${new Date().getSeconds()} -> ${text}\n`;

  fs.appendFile('errors.log', errorText, err => {
    if (err) {
      console.error(err);
    }
  });
}

module.exports = toLog;