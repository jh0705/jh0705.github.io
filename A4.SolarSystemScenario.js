/* global THREE */

// namespace
var A4 = window.A4 || (window.A4 = {})

const PLANET_DIST = 7.0
const PLANET_DIST_OFFSET = 10.0

A4.SolarSystemScenario = function () {
  var sunGeometry = new THREE.SphereGeometry(0.1, 32, 32)
  A4.Utils.generateVertexColors(sunGeometry)
  var sunMaterial = new THREE.MeshBasicMaterial({color: 0x000000})

  THREE.Mesh.call(this, sunGeometry, sunMaterial)

  this.simTime = 0
  this.planets = []
  this.setupPlanets()

  this.obstacles = this.planets
}

A4.Utils.extend(THREE.Mesh, A4.SolarSystemScenario)

A4.SolarSystemScenario.prototype.setupPlanets = function () {
  var planetInfo = this.planetInfo = [
    { name: 'Mercury', color: 0x00aa44, size: 1 },
    { name: 'Venus', color: 0xaaaa44, size: 1 },
    { name: 'Earth', color: 0x0044aa, size: 2 },
    { name: 'Mars', color: 0xdd4444, size: 1.5 },
    { name: 'Jupiter', color: 0xddaa00, size: 4 },
    { name: 'Saturn', color: 0xffaa44, size: 2.5 },
    { name: 'Uranus', color: 0x7777dd, size: 1.5 },
    { name: 'Neptune', color: 0x0000cc, size: 1 }
  ]

  for (var i = 0; i < planetInfo.length; i++) {
    let pi = planetInfo[i]
    // let pDist = PLANET_DIST * i + PLANET_DIST_OFFSET
    let pGeometry = new THREE.SphereGeometry(pi.size, 32, 32)
    let pMaterial = new THREE.MeshLambertMaterial({color: pi.color})
    let p = new THREE.Mesh(pGeometry, pMaterial)

    this.planets.push(p)
    this.add(p)
  }
}

A4.SolarSystemScenario.prototype.update = function (t) {
  var numPlanents = this.planets.length

  var st = this.simTime += 0.02
  for (var i = 0; i < numPlanents; i++) {
    var roation = (st / (i + 1)) % (Math.PI * 2)
    var rotationM = new THREE.Matrix4().makeRotationY(roation)
    var transM = new THREE.Matrix4().makeTranslation(PLANET_DIST_OFFSET + (i * PLANET_DIST), 0, 0)
    var posV = new THREE.Vector3(0, 0, 0)
    var finalM = new THREE.Matrix4().multiplyMatrices(rotationM, transM)
    posV.applyMatrix4(finalM)
    this.planets[i].setMatrix(finalM)
  }
}
