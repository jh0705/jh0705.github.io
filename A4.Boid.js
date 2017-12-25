/* global THREE */

// namespace
var A4 = window.A4 || (window.A4 = {})

const BOID_WIDTH = 50
const BOID_HEIGHT = 50
const BOID_DEPTH = 50

const BOID_SIZE_TIP = 0.6
const BOID_SIZE_BASE = 2
const BOID_SIZE_HEIGHT = 8
const BOID_NEAR_RADIUS = BOID_SIZE_BASE * 4
const BOID_NEAR_RADIUS_AVOID = 5
const BOID_NEAR_RADIUS_SEPARATE = BOID_SIZE_BASE * 2
// const BOID_NEAR_RADIUS_ALIGN = BOID_SIZE_BASE * 5
// const BOID_NEAR_RADIUS_COHESION = BOID_SIZE_BASE * 2

const BOID_SCALE_AVOID = 3
const BOID_SCALE_SEPARATE = 1
const BOID_SCALE_ALIGN = 100
const BOID_SCALE_COHESION = 1

const BOID_MAX_SPEED = 0.2
const BOID_MAX_FORCE = 0.01

var _boidCounter = 1
var DEFAULT_COLOURING = 0

A4.Boid = function (x, y, z) {
  // Call super()
  THREE.Object3D.call(this)

  // Create mesh
  var geometry = new THREE.ConeGeometry(BOID_SIZE_TIP, BOID_SIZE_BASE, BOID_SIZE_HEIGHT)
  var material = new THREE.MeshPhongMaterial({
    color: 0x156289,
    emissive: 0x072534,
    side: THREE.DoubleSide,
    shading: THREE.FlatShading
  })
  this.mesh = new THREE.Mesh(geometry, material)
  this.mesh.rotateX(Math.PI / 2)
  this.add(this.mesh)

  // Set unique ID
  this.id = _boidCounter++

  // Assume box around these numbers
  this.maxX = x || BOID_WIDTH
  this.maxY = y || BOID_HEIGHT
  this.maxZ = z || BOID_DEPTH

  // Position randomly (between 1 and -1)
  x = (x || BOID_WIDTH) * (Math.random() * 2 - 1) / 2
  y = (y || BOID_HEIGHT) * (Math.random() * 2 - 1) / 2
  z = (z || BOID_DEPTH) * (Math.random() * 2 - 1) / 2
  this.position.set(x, y, z)

  // Set custom vectors
  this.velocity = new THREE.Vector3((Math.random() * 2 - 1) / 10, (Math.random() * 2 - 1) / 10, (Math.random() * 2 - 1) / 10)
  this.heading = new THREE.Vector3(this.velocity)
  this.acceleration = new THREE.Vector3()
  this.r = BOID_SIZE_BASE
}

A4.Utils.extend(THREE.Object3D, A4.Boid)

A4.Boid.prototype.update = function (t, boids, obstacles, c) {
  t *= 100
  var nearest = this.getNearest(boids)
  // if (nearest.length === 0) return

  // Accumulate a new acceleration each time based on rules
  this.acceleration.set(0, 0, 0)
  if (nearest.length) {
    this.acceleration
      .addScaledVector(this.separate(nearest), BOID_SCALE_SEPARATE)
      .addScaledVector(this.cohesion(nearest), BOID_SCALE_COHESION)
      .addScaledVector(this.align(nearest), BOID_SCALE_ALIGN)
  }

  this.acceleration
    .addScaledVector(this.avoidObstacles(obstacles), BOID_SCALE_AVOID)
    .clampLength(-BOID_MAX_FORCE, BOID_MAX_FORCE)

  // Update new location by integrating the velocity
  this.velocity.addScaledVector(this.acceleration, t)
    .clampLength(-BOID_MAX_SPEED, BOID_MAX_SPEED)
  // Update new location by integrating the velocity
  this.position.addScaledVector(this.velocity, t)

  this.lookAt(this.heading.copy(this.position).add(this.velocity))
  this.enforceBorders()

  if( !c )
    this.mesh.material.color.setRGB((this.position.x/BOID_WIDTH+1)/2,
                                    (this.position.y/BOID_HEIGHT+1)/2,
                                    (this.position.z/BOID_DEPTH+1)/2)
  else
    this.mesh.material.color.setRGB((this.velocity.x/BOID_MAX_SPEED + 1)/2,
                                    (this.velocity.y/BOID_MAX_SPEED + 1)/2,
                                    (this.velocity.z/BOID_MAX_SPEED + 1)/2)
  console.log(this.mesh.material.color)
  this.mesh.material.needsUpdate = true
}

A4.Boid.prototype.getNearest = function (boids) {
  var nearest = []
  for (var i = 0; i < boids.length; i++) {
    if (boids[i].id === this.id) continue
    let d = this.position.distanceTo(boids[i].position)
    if (d <= BOID_NEAR_RADIUS) nearest.push(boids[i]) // ({ d, boid: boids[i] })
  }

  return nearest
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED - VELOCITY
A4.Boid.prototype.seek = function (target) {
  return target.add(this.velocity)
}

// Separation
// Method checks for nearby boids and steers away
A4.Boid.prototype.separate = function (boids) {
  var vectorSum = new THREE.Vector3()
  for (var i = 0; i < boids.length; i++) {
    if (this.position.distanceTo(boids[i].position) < BOID_NEAR_RADIUS_SEPARATE) {
      vectorSum.add(boids[i].position).sub(this.position)
    }
  }

  return vectorSum.multiplyScalar(-1)
}

// Separation for Obstacles
// Method checks for nearby obstacles and steers strongly away
A4.Boid.prototype.avoidObstacles = function (obs) {
  var vectorSum = new THREE.Vector3()

  for (var i = 0; i < obs.length; i++) {
    let ob = obs[i]

    // Support for column scenario
    let pos = ob.position
    let radius = ob.geometry.parameters.radius || ob.geometry.parameters.radiusTop
    
    if (ob.geometry.parameters.height) {
      pos = pos.clone()
      pos.y = this.position.y
    }

    let d = this.position.distanceTo(pos)
    if (d < radius * 2) {
      let separation = this.position.clone().sub(pos).multiplyScalar(d * d)
      vectorSum.add(separation)
    }
  }

  return vectorSum
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
A4.Boid.prototype.align = function (boids) {
  var velocity = new THREE.Vector3()

  for (var i = 0; i < boids.length; i++) {
    velocity.add(boids[i].velocity)
  }
  velocity.divideScalar(boids.length)

  return velocity.sub(this.velocity)
}

/**
 * For the average location (i.e. center) of all nearby boids, calculate
 * steering vector towards that location.
 * @param  {Boid[]} boids Array of nearby boids
 * @return {Vector3} Cohesion force vector
 */
A4.Boid.prototype.cohesion = function (boids) {
  var positionAvg = new THREE.Vector3()

  for (var i = 0; i < boids.length; i++) {
    positionAvg.add(boids[i].position)
  }

  positionAvg.divideScalar(boids.length)
  return positionAvg.sub(this.position)
}

/**
 * If an agent leaves the area wrap it arround back into the other side of the
 * box.
 */
A4.Boid.prototype.enforceBorders = function () {
  if (this.position.x < (-this.r + -this.maxX)) this.position.x = this.maxX + this.r
  if (this.position.y < (-this.r + -this.maxY)) this.position.y = this.maxY + this.r
  if (this.position.z < (-this.r + -this.maxZ)) this.position.z = this.maxZ + this.r
  if (this.position.x > this.maxX + this.r) this.position.x = (-this.r + -this.maxX)
  if (this.position.y > this.maxY + this.r) this.position.y = (-this.r + -this.maxY)
  if (this.position.z > this.maxZ + this.r) this.position.z = (-this.r + -this.maxZ)
}
