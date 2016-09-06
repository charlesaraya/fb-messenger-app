'use strict'

const DEFAULT_NAME = 'Tobby'

class Perro {
  constructor(name) {
    this.name = name || DEFAULT_NAME
  }
  getName () {
    console.log(this.name)
  }
}
exports.default = Perro
