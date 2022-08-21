import './style.css'
import * as THREE from 'three'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
//Can put objects in groups, easy to move, rotate... a bunch of stuff at once
const group = new THREE.Group()
scene.add(group)
//Adding meshes to the group
const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({color: 'green'})
)
cube1.position.set(-2, 1, 0)
group.add(cube1)
//Again
const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({color: 'green'})
)
cube2.position.set(-0.5, 1, 0)
group.add(cube2)
//Again
const cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({color: 'green'})
)
cube3.position.set(1, 1, 0)
group.add(cube3)
//Affecting the whole group
group.scale.set(0.5, 0.5, 0.5)
group.rotation.z = Math.PI/2
group.position.x = -2

//Moving our cube's position
mesh.position.x = 1
mesh.position.y = -1
mesh.position.x = 1
//Updating all 3 at once, does same as definining each individually
mesh.position.set(1, -1, 1)

//Setting scale 
mesh.scale.x = 2
mesh.scale.y = 0.5
mesh.scale.z = 0.5
//Or with a set
mesh.scale.set(2, 0.5, 0.5)
scene.add(mesh)

//Rotation: can use rotation or quaternion
//Rotation: Euler, not vector3, rotates about _ axis, pi is half rotation
mesh.rotation.x = Math.PI/6
mesh.rotation.y = Math.PI/4
mesh.rotation.z = Math.PI/3
//Caution: axes changes with rotation, can result in "gimbal lock"
//Can use object.rotation.reorder('YXZ') before changing rotation
//Rotation is easy to understand but can be problematic

//Quaternion: a more mathematical rotation
//Quaternion updates when you change the rotation, not covered yet

//Axes helper: helps us visualize 3d objects, move camera to see all axes
const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

/**
 * Sizes
 */
const sizes = {
    width: 800,
    height: 600
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.set(1, 1, 5)
scene.add(camera)

//Getting distance from object to camera (vector length)
console.log(mesh.position.distanceTo(camera.position))
console.log(mesh.position.length())
//Normalize reduces vector length to 1 with same direction
mesh.position.normalize()
console.log(mesh.position.length())

//lookAt(...) rotates object so its z faces target(must be vector3)
camera.lookAt(mesh.position)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)