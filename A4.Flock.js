/* global THREE */

// namespace
var A4 = window.A4 || (window.A4 = {})

// The Flock (a list of Boid agents)
A4.Flock = function (obstacles) {
  // Call super()
  THREE.Object3D.call(this)

  // An array for all the boids
  this.boids = []
  this.obstacles = obstacles
}

A4.Utils.extend(THREE.Object3D, A4.Flock)

A4.Flock.prototype.update = function (t) {
  for (var i = 0; i < this.boids.length; i++) {
    this.boids[i].update(t, this.boids, this.obstacles)  // Passing the entire list of boids to each boid individually
  }
}
A4.Flock.prototype.addBoid = function (b) {
  this.boids.push(b)
  this.add(b)
}
