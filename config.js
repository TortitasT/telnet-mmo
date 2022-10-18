require('dotenv').config()

class Config {
  static port = process.env.PORT || 8080
}

module.exports = Config
