/* global THREE, BOID_WIDTH, BOID_HEIGHT */

// namespace
var A4 = window.A4 || (window.A4 = {})

const COLUMNS_COUNT = 3

A4.ColumnScenario = function (numColumns, width, height) {
  // Super()
  THREE.Object3D.call(this)

  // Defaults
  numColumns = numColumns || COLUMNS_COUNT
  width = width || BOID_WIDTH
  height = height || BOID_HEIGHT

  this.columns = []
  this.setup(numColumns, width, height)

  this.obstacles = this.columns
}

A4.Utils.extend(THREE.Object3D, A4.ColumnScenario)

A4.ColumnScenario.prototype.setup = function (numColumns, width, height) {
  for (var i = 0; i < numColumns; i++) {
    let geometry = new THREE.CylinderGeometry(5, 5, 2 * height, 20)
    let material = new THREE.MeshLambertMaterial({ color: 0xffffff })
    let cylinder = new THREE.Mesh(geometry, material)
    cylinder.position.set(A4.Utils.rand(-width, width), 0, A4.Utils.rand(-width, width))

    this.columns.push(cylinder)
    this.add(cylinder)
  }
}

A4.ColumnScenario.prototype.update = function (t) {}
