import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

//Time
let time = Date.now()

//Time useing Clock - starts at 0 rather than time since 1970 like Date
const clock =  new THREE.Clock()

//Animations

//Have added GSAP(GreenSock) library for bonus tools ~ npm install gsap@3.5.1
//Moves cube to x=2 after 1s, back after 2
// gsap.to(mesh.position, { duration: 1, delay: 1, x: 2})
// gsap.to(mesh.position, { duration: 1, delay: 2, x: 0})

//requestAnimationFrame - function to be repeated on the next frame
const tick = () =>
{
    //Want constant movement across framerates - use time instead of frames
    //Using built in time from js: quick tick -> small increase
    const currentTime = Date.now()
    const deltaTime = currentTime - time
    time = currentTime
    mesh.position.y += 0.0001 * deltaTime

    //Using Clock
    const elapsedTime = clock.getElapsedTime()
    mesh.rotation.z = elapsedTime * Math.PI/4
    mesh.position.x = Math.sin(elapsedTime)
    mesh.position.z = Math.cos(elapsedTime)/4

    //Render
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
//Call it to start loop
tick()
