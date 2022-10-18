const chalk = require('chalk')

class Map {
  tiles = []

  constructor(map) {
    if (map) {
      this.tiles = map.tiles
    }
  }

  generate(sizeX, sizeY) {
    for (let x = 0; x < sizeX; x++) {
      let column = []
      for (let y = 0; y < sizeY; y++) {
        column.push(new Tile(x, y, 'grass'))
      }
      this.tiles.push(column)
    }
    return this
  }

  getTile({ x, y, z }) {
    if (this.tiles[x] && this.tiles[x][y]) {
      return this.tiles[x][y]
    }

    return null
  }

  setActorId({ x, y, z }, actorId) {
    if (this.tiles[x] && this.tiles[x][y]) {
      this.tiles[x][y].actorId = actorId
      return true
    }

    return null
  }

  spawnUser(user) {
    if (user.hasSpawned()) {
      this.setActorId(user.position, user.id)
      return
    }

    user.position = { x: 0, y: 0, z: 0 }
    while (this.getTile(user.position).actorId !== null) {
      user.position = {
        x: Math.floor(Math.random() * 10),
        y: Math.floor(Math.random() * 10),
        z: 0,
      }
    }

    this.setActorId(user.position, user.id)
  }

  writeToFile(path = 'mapDump.json') {
    const json = JSON.stringify(this)
    fs.writeFile(path, json, 'utf8', function () {
      console.log(`Map written to file ${path}`)
    })
  }

  getDisplayInCoordinates(coordinates) {
    let display = ''

    for (let y = coordinates.y - 5; y < coordinates.y + 5; y++) {
      for (let x = coordinates.x - 5; x < coordinates.x + 5; x++) {
        const tile = this.getTile({ x, y, z: 0 })

        if (tile == null) {
          display += ' '
          continue
        }

        if (tile.actorId === null) {
          display += chalk.green(tile.type[0])
        } else {
          display += chalk.blue('X')
        }
      }
      display += '\n'
    }

    return display
  }
}

class Tile {
  x
  y
  type
  actorId
  constructor(x, y, type) {
    this.x = x
    this.y = y
    this.type = type
    this.actorId = null
  }
}

module.exports = { Map, Tile }
