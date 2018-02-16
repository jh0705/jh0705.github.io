/* global THREE */

// namespace
var A4 = window.A4 || (window.A4 = {})

A4.Utils = {}
A4.Utils.extend = function (base, sub) {
  sub.prototype = Object.create(base.prototype)
  sub.prototype.constructor = sub
}

A4.Utils.clone = function (obj) {
  if (obj == null || typeof obj !== 'object') return obj
  var copy = obj.constructor()
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr]
  }
  return copy
}

A4.Utils.rand = function (min, max) {
  return Math.random() * (max - min) + min
}

/**
 * Returns a Object3D with colored X, Y, and Z axis for visualization
 * @param  {Number}   length  [Optional] Length of the axis. Default 100.
 * @param  {Boolean}  dashed  [Optional] True if axis lines are dashed. Default false.
 * @return {Object3D} An object with the 3 axis lines as children
 */
A4.Utils.createAxis = function (length, dashed) {
  length = length || 100

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

  var xAxis = buildAxis(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(length, 0, 0),
    0xFF0000,
    dashed
  )
  var yAxis = buildAxis(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, length, 0),
    0x00ff00,
    dashed
  )
  var zAxis = buildAxis(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, length),
    0x0000FF,
    dashed
  )

  var axis = new THREE.Object3D()
  axis.add(xAxis)
  axis.add(yAxis)
  axis.add(zAxis)
  return axis
}

/**
 * Creates a helper grid along the X-Y plane
 * @param  {Number} size  [Optional] The width/length of the gride. Default 50.
 * @param  {Number} step  [Optional] The gap between grid lines. Default 2.
 * @param  {Number} color [Optional] Hex grid line color. Default 0xBBBBBB.
 * @return {Line} ThreeJS Line object with all grid lines
 */
A4.Utils.createGrid = function (size, step, color) {
  size = size || 50
  step = step || 2
  color = color || 0xBBBBBB

  var gridGeometry = new THREE.Geometry()
  for (var i = -size; i <= size; i += step) {
    gridGeometry.vertices.push(new THREE.Vector3(i, 0, -size))
    gridGeometry.vertices.push(new THREE.Vector3(i, 0, size))
    gridGeometry.vertices.push(new THREE.Vector3(-size, 0, i))
    gridGeometry.vertices.push(new THREE.Vector3(size, 0, i))
  }

  var gridMaterial = new THREE.LineBasicMaterial({ color })
  return new THREE.Line(gridGeometry, gridMaterial, THREE.LinePieces)
}

A4.Utils.generateVertexColors = function (geometry) {
  var len = geometry.faces.length
  for (var i = 0; i < len; i++) {
    geometry.faces[i].vertexColors.push(
      new THREE.Color().setHSL(i / len * Math.random(), 0.5, 0.5),
      new THREE.Color().setHSL(i / len * Math.random(), 0.5, 0.5),
      new THREE.Color().setHSL(i / len * Math.random(), 0.5, 0.5)
    )
    geometry.faces[i].color = new THREE.Color().setHSL(i / len * Math.random(), 0.5, 0.5)
  }
}
