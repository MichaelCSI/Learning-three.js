import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
//dat.gui was 'old', using lil-gui
import * as dat from 'lil-gui'

/**
 * Debug
 */
const gui = new dat.GUI({width: 300})
//Object made just for color changing, functions... for gui
const parameters = {
    color: 0xff0000,
    spin: ()=>{
        gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y+Math.PI*2})
    },
    forward: ()=>{
        gsap.to(mesh.position, { duration: 0.5, z: mesh.position.z + 0.5})
    },
    backward: ()=>{
        gsap.to(mesh.position, { duration: 0.5, z: mesh.position.z - 0.5})
    },
    resetPosition: ()=>{
        gsap.to(mesh.position, { duration: 0.5, x: 0, y: 0, z: 0})
    },
    reverseSpins: ()=>{
        gsap.to(mesh.rotation, { duration: 0.5, x: 0, y: 0, z: 0})
    }
}

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: parameters.color})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

//Debug
//.add takes object property to be tweaked, can also pass min/max... as params
//Format can vary, newlines for clarity
gui
    .add(mesh.position, 'y')
    .min(-3)
    .max(3)
    .step(0.01)
    .name("Elevation")
gui
    .add(mesh, 'visible')
gui
    .add(material, 'wireframe')
//Color is weird, can just add since #ff0000, 0xff0000 is not necessarily a color
//Use the object we made as a "color" object
gui
    .addColor(parameters, 'color')
    //Need to relate our parameters object's color to the material
    .onChange(() => {
        material.color.set(parameters.color)
    })
//Functions are like color, need an object, using our parameters object
gui
    .add(parameters, 'spin')
gui 
    .add(parameters, 'forward')
gui 
    .add(parameters, 'backward')
gui
    .add(parameters, 'resetPosition')
gui
    .add(parameters, 'reverseSpins')

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()