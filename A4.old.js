/***
 * Created by Glen Berseth March 22, 2017
 * Created for Assignment 4 of CPSC426.
 */

/* global THREE, THREEx */

// Build a visual axis system
function buildAxis (src, dst, colorHex, dashed) {
  var geom = new THREE.Geometry()
  var mat

  if (dashed) {
    mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 })
  } else {
    mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex })
  }

  geom.vertices.push(src.clone())
  geom.vertices.push(dst.clone())
  geom.computeLineDistances() // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

  var axis = new THREE.Line(geom, mat, THREE.LinePieces)
  return axis
}
var length = 100.0
// Build axis visuliaztion for debugging.
var xAxis = buildAxis(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(length, 0, 0),
      0xFF0000,
      false
  )
var yAxis = buildAxis(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, length, 0),
      0x00ff00,
      false
  )
var zAxis = buildAxis(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, length),
      0x0000FF,
      false
  )

// ASSIGNMENT-SPECIFIC API EXTENSION
THREE.Object3D.prototype.setMatrix = function (a) {
  this.matrix = a
  this.matrix.decompose(this.position, this.quaternion, this.scale)
}
// ASSIGNMENT-SPECIFIC API EXTENSION
// For use with matrix stack
THREE.Object3D.prototype.setMatrixFromStack = function () {
  this.matrix = mvMatrix
  this.matrix.decompose(this.position, this.quaternion, this.scale)
}

// Data to for the camera view
var mouseX = 0
var mouseY = 0
var windowWidth
var windowHeight
var backgroundColour = 0.2
var views = [
  {
    left: 0,
    bottom: 0,
    width: 1.0,
    height: 1.0,
    background: new THREE.Color().setRGB(backgroundColour, backgroundColour, backgroundColour),
    eye: [ 80, 20, 80 ],
    up: [ 0, 1, 0 ],
    fov: 45,
    updateCamera: function (camera, scene, mouseX, mouseY) {
      // camera.position.x += mouseX * 0.05;
      // camera.position.x = Math.max( Math.min( camera.position.x, 2000 ), -2000 );
    }
  }
]

var STATE = {
  World_Control: {value: 1, name: 'World_Control'},
  Relative_Control: {value: 2, name: 'Relative_Control'},
  GeoSync_Control: {value: 3, name: 'GeoSync_Control'}
}

// SETUP RENDERER & SCENE
var canvas = document.getElementById('canvas')
var scene = new THREE.Scene()
var renderer = new THREE.WebGLRenderer()
renderer.shadowMap.enabled = true
// renderer.setClearColor(0xFFFFFF); // white background colour
canvas.appendChild(renderer.domElement)

// Creating the camera and adding them to the scene.
var view = views[0]
var cameraMotherShip = new THREE.PerspectiveCamera(view.fov, window.innerWidth / window.innerHeight, 1, 10000)
cameraMotherShip.position.x = view.eye[ 0 ]
cameraMotherShip.position.y = view.eye[ 1 ]
cameraMotherShip.position.z = view.eye[ 2 ]
cameraMotherShip.up.x = view.up[ 0 ]
cameraMotherShip.up.y = view.up[ 1 ]
cameraMotherShip.up.z = view.up[ 2 ]
cameraMotherShip.lookAt(scene.position)
cameraMotherShip.lookAtPoint = scene.position.clone()
view.camera = cameraMotherShip
scene.add(view.camera)

// Adding the axis debug visualizations
scene.add(xAxis)
scene.add(yAxis)
scene.add(zAxis)

// ADAPT TO WINDOW RESIZE
function resize () {
  windowWidth = window.innerWidth
  windowHeight = window.innerHeight
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// EVENT LISTENER RESIZE
window.addEventListener('resize', resize)
resize()

// SCROLLBAR FUNCTION DISABLE
window.onscroll = function () {
  window.scrollTo(0, 0)
}

// var ambientLight = new THREE.AmbientLight( 0x000000 );
var ambientLight = new THREE.AmbientLight(0x555555)
scene.add(ambientLight)

var lights = []
lights[ 0 ] = new THREE.PointLight(0xffffff, 1, 0)
lights[ 1 ] = new THREE.PointLight(0xffffff, 1, 0)
lights[ 2 ] = new THREE.PointLight(0xffffff, 1, 0)

lights[ 0 ].position.set(0, 200, 0)
lights[ 1 ].position.set(100, 200, 100)
lights[ 2 ].position.set(-100, -200, -100)

scene.add(lights[ 0 ])
scene.add(lights[ 1 ])
scene.add(lights[ 2 ])

// SETUP HELPER GRID
// Note: Press Z to show/hide
var gridGeometry = new THREE.Geometry()
var i
for (i = -50; i < 51; i += 2) {
  gridGeometry.vertices.push(new THREE.Vector3(i, 0, -50))
  gridGeometry.vertices.push(new THREE.Vector3(i, 0, 50))
  gridGeometry.vertices.push(new THREE.Vector3(-50, 0, i))
  gridGeometry.vertices.push(new THREE.Vector3(50, 0, i))
}

var gridMaterial = new THREE.LineBasicMaterial({color: 0xBBBBBB})
var grid = new THREE.Line(gridGeometry, gridMaterial, THREE.LinePieces)

/// //////////////////////////////
//   YOUR WORK STARTS BELOW    //
/// //////////////////////////////

var manager = new THREE.LoadingManager()
manager.onProgress = function (item, loaded, total) {
  console.log(item, loaded, total)
}

// TO-DO: INITIALIZE THE REST OF YOUR MATRICES
// Note: Use of parent attribute IS allowed.
// Hint: Keep hierarchies in mind!

// Create pivot point for obstacles
var geometry = new THREE.SphereGeometry(0.1, 32, 32)
generateVertexColors(geometry)
var material = new THREE.MeshBasicMaterial({color: 0x000000})
var sun = new THREE.Mesh(geometry, material)
scene.add(sun)

var planets = []
var obstacles = []
var planet_info = [
  {
    name: 'Mercury',
    color: 0x00aa44,
    size: 0.5
  },
  {
    name: 'Venus',
    color: 0xaaaa44,
    size: 0.8
  },
  {
    name: 'Earth',
    color: 0x0044aa,
    size: 1.2
  },
  {
    name: 'Mars',
    color: 0xdd4444,
    size: 0.81
  },
  {
    name: 'Jupiter',
    color: 0xddaa00,
    size: 2.2
  },
  {
    name: 'Saturn',
    color: 0xffaa44,
    size: 1.8
  },
  {
    name: 'Uranus',
    color: 0x7777dd,
    size: 1.0
  },
  {
    name: 'Neptune',
    color: 0x0000cc,
    size: 0.8
  }
]

var dist_ = 7.0
var dist_adjust = 10.0
for (p = 0; p < planet_info.length; p++) {
  var planet_i = planet_info[p]
  var dist_tmp = (dist_ * p) + dist_adjust
  var geometry = new THREE.SphereGeometry(planet_i.size, 32, 32)
  // generateVertexColors( geometry );
  var material = new THREE.MeshLambertMaterial({color: planet_i.color})
  var mercury = new THREE.Mesh(geometry, material)
  planets.push(mercury)
  obstacles.push(new THREE.Vector3(0, 0, 0))

  sun.add(mercury)
}

var clock = new THREE.Clock(true)

var animate = true // animate?
var orbit_distance = 4.0

var sim_time = 0.0

function updateSystem () {
  // Animate your solar system here.
  if (!animate) {
    return
  }
  var num_planents = planets.length
  var time = clock.getElapsedTime() // t seconds passed since the clock started.
  sim_time = sim_time + 0.02
  var dist_scale = dist_
  var rot_scale = 0.8
  for (p = 0; p < num_planents; p++) {
    var roation = (sim_time / (p + 1.0)) % (Math.PI * 2.0)
    var rotationM = new THREE.Matrix4().makeRotationY(roation)
    var transM = new THREE.Matrix4().makeTranslation(dist_adjust + (p * dist_scale), 0, 0)
    var posV = new THREE.Vector3(0, 0, 0)
    var finalM = new THREE.Matrix4().multiplyMatrices(rotationM, transM)
    posV.applyMatrix4(finalM)
    planets[p].setMatrix(finalM)
    obstacles[p] = posV
  }
  flock.run(time)
}

// LISTEN TO KEYBOARD
// Hint: Pay careful attention to how the keys already specified work!
var keyboard = new THREEx.KeyboardState()
var gridState = false
var key
var camera
var old_ModelView
var CONTROL_STATE = STATE.World_Control
var step_size = 1.0
var mouseMove__ = 0
var startDrag_ = 0

function onMouseDrag (event) {
  if (startDrag_ == 1 && (CONTROL_STATE.value == STATE.GeoSync_Control.value)) {
    var delta = event.pageY - mouseY
    geoSynchronousOrbitAdjust(camera, step_size * delta)
    mouseY = event.pageY
  } else if (startDrag_ == 1) {
    var deltaY = event.pageY - mouseY
    var deltaX = event.pageX - mouseX
    var mI = camera.matrixWorld
    var scaling = 0.001
    // Pitch
    var rotationX = new THREE.Matrix4().makeRotationX(-step_size * deltaY * scaling)
    mI.multiplyMatrices(mI, rotationX)
        // Yaw
    var rotationY = new THREE.Matrix4().makeRotationY(-step_size * deltaX * scaling)
    mI.multiplyMatrices(mI, rotationY)
    camera.setMatrix(mI)
    mouseX = event.pageX
    mouseY = event.pageY
  }
}

function onMouseUp (event) {
  if (event.button === THREE.MOUSE.LEFT && ((CONTROL_STATE.value == STATE.Relative_Control.value) ||
      (CONTROL_STATE.value == STATE.GeoSync_Control.value))) {
    startDrag_ = 0
    document.removeEventListener('mouseup', onMouseUp, false)
    document.removeEventListener('mousemove', onMouseDrag, false)
  }
}

function onMouseDown (event) {
  if (event.button === THREE.MOUSE.LEFT && ((CONTROL_STATE.value == STATE.Relative_Control.value) ||
      (CONTROL_STATE.value == STATE.GeoSync_Control.value))) {
    startDrag_ = 1
    mouseX = event.pageX
    mouseY = event.pageY
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mousemove', onMouseDrag)
  }
}

document.addEventListener('mousedown', onMouseDown, false)

function onMouseMove (event) {
  if ((mouseMove__ == 1)) { // only way to get initial mouse position.
    mouseX = event.pageX
    mouseY = event.pageY
    mouseMove__ = 2
  } else if (mouseMove__ == 2) {
    var delta = event.pageY - mouseY
    var mI = camera.matrixWorld
    var rotationM = new THREE.Matrix4().makeTranslation(0, 0, step_size * delta)
    mI.multiplyMatrices(mI, rotationM)
    camera.setMatrix(mI)
    mouseY = event.pageY
  }
}

function onKeyUp (event) {
  if (keyboard.eventMatches(event, 't')) {
    mouseMove__ = 0
    keyboard.domElement.removeEventListener('keyup', onKeyUp, false)
    keyboard.domElement.removeEventListener('mousemove', onMouseMove, false)
  }
}

function onKeyDown (event) {
  // TO-DO: BIND KEYS TO YOUR CONTROLS
  if (keyboard.eventMatches(event, 'shift+g')) {  // Reveal/Hide helper grid
    gridState = !gridState
    gridState ? scene.add(grid) : scene.remove(grid)
  } else if (keyboard.eventMatches(event, 'space')) {
    animate = !animate
  } else if (keyboard.eventMatches(event, 't') && (!event.repeat) &&
      (CONTROL_STATE.value === STATE.Relative_Control.value)) {
    mouseMove__ = 1
    keyboard.domElement.addEventListener('keyup', onKeyUp)
    keyboard.domElement.addEventListener('mousemove', onMouseMove)
  }
}
keyboard.domElement.addEventListener('keydown', onKeyDown)

function clone (obj) {
  if (obj == null || typeof obj !== 'object') return obj
  var copy = obj.constructor()
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr]
  }
  return copy
}

const BOID_SIZE_TIP = 0.6
const BOID_SIZE_BASE = 2
const BOID_SIZE_HEIGHT = 8
const BOID_NEAR_RADIUS = BOID_SIZE_HEIGHT * 10

const BOID_SCALE_AVOID = 1
const BOID_SCALE_SEPARATE = 1
const BOID_SCALE_ALIGN = 1
const BOID_SCALE_COHESION = 1

var _boidCounter = 1

var Boid = function (x, y, z) {
  this.id = _boidCounter++

  /// Assume box around these numbers
  this.maxX = x
  this.maxY = y
  this.maxZ = z
  this.acceleration = new THREE.Vector3(0, 0, 0)
  this.x = x * ((1 - (-1)) * Math.random()) * 2
  this.y = y * ((1 - (-1)) * Math.random()) * 2
  this.z = z * ((1 - (-1)) * Math.random()) * 2
  console.log('Random Position: (' + x + ', ' + y + ', ' + z + ')')

  this.velocity = new THREE.Vector3(0, 0, 0)
  this.position = new THREE.Vector3(x, y, z)
  this.r = BOID_SIZE_BASE

  /// Maximum speed
  this.maxspeed = 0.4

  /// Maximum steering force
  this.maxforce = 0.03

  /// Create Geometry
  var geometry = new THREE.ConeGeometry(BOID_SIZE_TIP, BOID_SIZE_BASE, BOID_SIZE_HEIGHT)
  var material = new THREE.MeshPhongMaterial({
    color: 0x156289,
    emissive: 0x072534,
    side: THREE.DoubleSide,
    shading: THREE.FlatShading
  })
  this.geom = new THREE.Mesh(geometry, material)
  scene.add(this.geom)
}
Boid.prototype.run = function (t, boids) {
  this.flock(boids)
  this.update(t)
  this.borders()
  this.render()
}

/// Accumulate a new acceleration each time based on rules
Boid.prototype.flock = function (boids) {
  var nearest = this.getNearest(boids)

  var avoid = this.separateObs()
  var separate = this.separate(nearest)
  var align = this.align(nearest)
  var cohesion = this.cohesion(nearest)

  this.acceleration.set(0, 0, 0)
    .addScaledVector(avoid, BOID_SCALE_AVOID)
    .addScaledVector(separate, BOID_SCALE_SEPARATE)
    .addScaledVector(align, BOID_SCALE_ALIGN)
    .addScaledVector(cohesion, BOID_SCALE_COHESION)
}

/// Update new location by integrating the velocity
Boid.prototype.update = function (t) {
  this.velocity.addScaledVector(this.acceleration, t)
  this.position.addScaledVector(this.velocity, t)
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED - VELOCITY
Boid.prototype.seek = function (target) {
}

/// Render the location of the boid agent
Boid.prototype.render = function () {
  this.geom.position.set(this.x, this.y, this.z)
}

/// If an agent leaves the area wrap it arround back into the other side of the box
Boid.prototype.borders = function () {
  if (this.position.x < (-this.r + -this.maxX)) this.position.x = this.maxX + this.r
  if (this.position.y < (-this.r + -this.maxY)) this.position.y = this.maxY + this.r
  if (this.position.z < (-this.r + -this.maxZ)) this.position.z = this.maxZ + this.r
  if (this.position.x > this.maxX + this.r) this.position.x = (-this.r + -this.maxX)
  if (this.position.y > this.maxY + this.r) this.position.y = (-this.r + -this.maxY)
  if (this.position.z > this.maxZ + this.r) this.position.z = (-this.r + -this.maxZ)
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function (boids) {
	// get average position
	var positionSum = new THREE.Vector3(0, 0, 0)
	for ( var i = 0; i < boids.length; i++ ) {
		positionSum.add(boids[i].position)
	}
	positionSum.divideScalar(boids.length)	// convert to average position
	var averagePosition = positionSum

	averagePosition.sub(this.position)			// convert to vector pointing to average position
	averagePosition.negate()					// point away from average position
	var separationVector = averagePosition

	separationVector.divideScalar(separationVector.length()*separationVector.length())	// scale by 1/r^2 -- weaker separation force as distance increases
	return separationVector
}

// Separation for Obstacles
// Method checks for nearby obstacles and steers strongly away
Boid.prototype.separateObs = function (obs) {

}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function (boids) {
	var velocity = new THREE.Vector3(0,0,0)
	
	for( var i = 0; i < boids.length; i++ ) {
		// console.log('Random Position: (' + this.x + ', ' + this.y + ', ' + this.z + ')')
		velocity.add(boids[i].velocity)
	}

	velocity.divideScalar(boids.length)
	this.velocity = velocity
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function (boids) {
	// get average position
	var positionSum = new THREE.Vector3(0, 0, 0)
	for ( var i = 0; i < boids.length; i++ ) {
		positionSum.add(boids[i].position)
	}
	positionSum.divideScalar(boids.length)	// convert to average position
	var averagePosition = positionSum

	averagePosition.sub(this.position)			// convert to vector pointing to average position
	var cohesionVector = averagePosition

	cohesionVector.divideScalar(cohesionVector.length())	// scale by 1/r -- weaker cohesion force as distance increases
	return cohesionVector
}

Build.prototype.getNearest = function (boids) {

}

Boid.prototype.getNearest = function (boids) {
  var nearest = []
  for (var i = 0; i < boids.length; i++) {
    if (boids[i].id === this.id) continue
    let d = this.position.distanceTo(boids[i].position)
    if (d <= BOID_NEAR_RADIUS) nearest.push(boids[i]) // ({ d, boid: boids[i] })
  }

  return nearest
}

// The Flock (a list of Boid agents)
var Flock = function () {
  // An array for all the boids
  this.boids = [] // Initialize the array
}
Flock.prototype.run = function (t) {
  for (var i = 0; i < this.boids.length; i++) {
    this.boids[i].run(t, this.boids)  // Passing the entire list of boids to each boid individually
  }
}
Flock.prototype.addBoid = function (b) {
  this.boids.push(b)
}

function draw () {
  background(50)
  flock.run()
}

// SETUP UPDATE CALL-BACK
// Hint: It is useful to understand what is being updated here, the effect, and why.
function update () {
  updateSystem()
  requestAnimationFrame(update)

  // UPDATES THE MULTIPLE CAMERAS IN THE SIMULATION
  for (var ii = 0; ii < views.length; ++ii) {
    view = views[ii]
    camera_ = view.camera

    view.updateCamera(camera_, scene, mouseX, mouseY)

    var left = Math.floor(windowWidth * view.left)
    var bottom = Math.floor(windowHeight * view.bottom)
    var width = Math.floor(windowWidth * view.width)
    var height = Math.floor(windowHeight * view.height)
    renderer.setViewport(left, bottom, width, height)
    renderer.setScissor(left, bottom, width, height)
    renderer.setScissorTest(true)
    renderer.setClearColor(view.background)

    camera_.aspect = width / height
    camera_.updateProjectionMatrix()

    renderer.render(scene, camera_)
  }
}

const BOID_WIDTH = 25
const BOID_HEIGHT = 25
const BOID_DEPTH = 25

// Add an initial set of boids into the system
var flock = new Flock()
for (var bi = 0; bi < 150; bi++) {
  var _boid = new Boid(BOID_WIDTH, BOID_HEIGHT, BOID_DEPTH)
  flock.addBoid(_boid)
}

update()
