/* global THREE */
var default_colour = 1
// ASSIGNMENT-SPECIFIC API EXTENSION
THREE.Object3D.prototype.setMatrix = function (a) {
  this.matrix = a
  this.matrix.decompose(this.position, this.quaternion, this.scale)
}

// namespace
var A4 = window.A4 || (window.A4 = {})

A4.Engine = function (canvas) {
  var scene = this.scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x444444, 0.002)

  var renderer = this.renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(scene.fog.color)
  renderer.setPixelRatio(window.devicePixelRatio)
  // this.renderer.shadowMap.enabled = true
  canvas.appendChild(renderer.domElement)

  this.setupWindow()
  this.setupCamera()
  this.setupLights()
  this.setupGrid()
  this.setupAxis()
  this.createFlock()
}

/**
 * Setups window resize and scroll handlers
 */
A4.Engine.prototype.setupWindow = function () {
  var renderer = this.renderer
  // WINDOW SETUP
  function resize () {
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('scroll', function () { window.scrollTo(0, 0) })
  window.addEventListener('resize', resize)
  resize()
}

/**
 * Creates a main PerspectiveCamera and adds it to the scene
 */
A4.Engine.prototype.setupCamera = function () {
  var camera = this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.set(80, 20, 80)
  camera.up.set(0, 1, 0)
  camera.lookAt(this.scene.position)
  camera.lookAtPoint = this.scene.position.clone()
  this.scene.add(camera)
  this.viewSettings = { left: 0, bottom: 0, width: 1.0, height: 1.0, background: new THREE.Color(0.2, 0.2, 0.2) }

  this.controls = new THREE.OrbitControls(camera, this.renderer.domElement)
}

/**
 * Creates an ambient light and 3 point lights and adds them to the scene
 */
A4.Engine.prototype.setupLights = function () {
  var scene = this.scene
  var ambientLight = this.ambientLight = new THREE.AmbientLight(0x555555)
  scene.add(ambientLight)

  var lights = this.lights = []
  lights[0] = new THREE.PointLight(0xffffff, 1, 0)
  lights[1] = new THREE.PointLight(0xffffff, 1, 0)
  lights[2] = new THREE.PointLight(0xffffff, 1, 0)
  lights[0].position.set(0, 200, 0)
  lights[1].position.set(100, 200, 100)
  lights[2].position.set(-100, -200, -100)
  scene.add(lights[ 0 ])
  scene.add(lights[ 1 ])
  scene.add(lights[ 2 ])
}

/**
 * Creates a helper axis
 */
A4.Engine.prototype.setupAxis = function () {
  this.scene.add(A4.Utils.createAxis())
}

/**
 * Creates a helper grid (press Z to show/hide)
 */
A4.Engine.prototype.setupGrid = function () {
  var scene = this.scene
  var grid = this.grid = A4.Utils.createGrid()
  var gridShown = false

  document.addEventListener('keydown', function (e) {
    console.log('Keydown', e)
    if (e.key === 'z') {
      gridShown = !gridShown
      gridShown ? scene.add(grid) : scene.remove(grid)
    }
    else if (e.key === '1')
    	default_colour = !default_colour
  })
}

/**
 * Creates the main flock
 */
A4.Engine.prototype.createFlock = function () {
  // Add an initial set of boids into the system
  var flock = this.flock = new A4.Flock(this.scenario ? this.scenario.obstacles : [])
  var count = 500
  while (count--) {
    flock.addBoid(new A4.Boid())
  }
  this.scene.add(flock)
}

/**
 * Unloads the current scenario and sets the new one
 * @param {Object3D} scenario A ThreeJS Object with an obstacles array property.
 */
A4.Engine.prototype.setScenario = function (scenario) {
  if (this.scenario) {
    this.scene.remove(this.scenario)
  }

  this.scenario = scenario
  this.flock.obstacles = scenario.obstacles
  this.scene.add(scenario)
}

/**
 * Runs the main animation loop
 */
A4.Engine.prototype.run = function () {
  this._cacheW = -1
  this._cacheH = -1
  this.clock = new THREE.Clock(true)

  this.update()
}
A4.Engine.prototype.update = function () {
  window.requestAnimationFrame(this.update.bind(this))

  var time = this.clock.getDelta() // t seconds since clock started

  // Update sims
  if (this.scenario) this.scenario.update(time)
  if (this.flock) this.flock.update(time, default_colour)

  // Avoid setting viewport constantly
  if (this._cacheW !== window.innerWidth || this._cacheH !== window.innerHeight) {
    var left = Math.floor(window.innerWidth * this.viewSettings.left)
    var bottom = Math.floor(window.innerHeight * this.viewSettings.bottom)
    var width = Math.floor(window.innerWidth * this.viewSettings.width)
    var height = Math.floor(window.innerHeight * this.viewSettings.height)
    this.renderer.setViewport(left, bottom, width, height)
    this.renderer.setScissor(left, bottom, width, height)
    this.renderer.setScissorTest(true)
    // this.renderer.setClearColor(this.viewSettings.background)

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this._cacheW = window.innerWidth
    this._cacheH = window.innerHeight
  }

  // Render!
  this.renderer.render(this.scene, this.camera)
}

// ENTRY POINT
var canvas = document.getElementById('canvas')
var engine = new A4.Engine(canvas)
// engine.setScenario(new A4.ColumnScenario())
engine.setScenario(new A4.SolarSystemScenario())
engine.run()
