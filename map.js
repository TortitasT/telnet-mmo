class Map {
  tiles = []

  constructor(sizeX, sizeY) {
    for (let x = 0; x < sizeX; x++) {
      let column = []
      for (let y = 0; y < sizeY; y++) {
        column.push(new Tile(x, y, 'grass'))
      }
      this.tiles.push(column)
    }
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
