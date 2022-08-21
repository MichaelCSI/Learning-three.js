import './style.css'
import * as THREE from 'three'
//For our camera OrbitControls
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

//Getting cursor coordinates, native js
const cursor = {
    x: 0,
    y: 0
}
window.addEventListener('mousemove', (event)=> {
    //We want a reliable 0 to 1 instead of pixels so divide by size
    //Can also do -0.5 to 0.5
    cursor.x = event.clientX/sizes.width -0.5
    cursor.y = event.clientY/sizes.height - 0.5
})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Scene
const scene = new THREE.Scene()

// Object
const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
)
scene.add(mesh)

const aspectRatio = sizes.width/sizes.height
// Camera - new parameters: (fov(vertical), aspect ratio, near, far)
//Closer than near or further than far will not show up
    //Dont use extreme values: z fighting/glitchy overlap of textures
    //Good for not rendering what we don't need to
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 100)

//Orthographic camera: no perspective of near/far
    //Parameters are how far it can see in each direction (l, r, t, b)+near, far
    //* aspcect ratio since we render a square area (2x2) from (l, r, t, b)
    //Our square area is stretched to fit aspect ratio, so we do this
// const camera = new THREE.OrthographicCamera(
//     -1* aspectRatio, 
//     1 * aspectRatio,
//     1, 
//     -1, 
//     1, 100)
camera.position.z = 3
camera.lookAt(mesh.position)
scene.add(camera)

//OrbitControls
//R click to move cube, L click to move around, scroll zoom
const controls = new OrbitControls(camera, canvas)
//Damping to keep momentum, smooth
controls.enableDamping = true
// //Can change the "lookAt" by setting target
// controls.target.y = 1
controls.update()

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    //mesh.rotation.y = elapsedTime;

    // //Update camera
    // //Using sin and cos to simulate rotation around object
    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3
    // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3
    // camera.position.y = -cursor.y * 5
    // //LookAt to make it seem like the cube is rotating not the camera
    // //Note: normally looks at (0,0,0), now looks at vector pos of cube
    // camera.lookAt(mesh.position)

    //Note: OrbitConrtols does this and more, many other cool controls 
    // Need to import from other than THREE, see a bit above
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()