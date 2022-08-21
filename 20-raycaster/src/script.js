import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { Vector3 } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)


/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()

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
 * Mouse - in general would put this in tick since some browsers update faster than frames
 */
 const mouse = new THREE.Vector2()

 // Move, _event can be anything i.e a
 window.addEventListener('mousemove', (_event) => {
     // Values on -1 to 1
     mouse.x = _event.clientX / sizes.width * 2 - 1
     mouse.y = - (_event.clientY / sizes.height) * 2 + 1 // Negative to make up +, down -
 })

 // Click
 window.addEventListener('click', () => {
     if(currentIntersect != null){
         switch(currentIntersect.object){
             case object1:
                console.log("Click on a sphere 1")
                break;
            case object2:
                console.log("Click on a sphere 2")
                break;
            case object3:
                console.log("Click on a sphere 3")
                break;
            default:
                console.log("Banana")
         }
     }
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

// Raycaster "witness" variable
let currentIntersect = null

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    object1.position.y = Math.sin(elapsedTime * 0.5) * 1.5
    object2.position.y = Math.sin(elapsedTime * 0.7) * 1.5
    object3.position.y = Math.sin(elapsedTime * 0.9) * 1.5



    // Raycaster - created above

    // const rayOrigin = new THREE.Vector3(-3, 0, 0)
    // const rayDirection = new THREE.Vector3(10, 0, 0)
    // rayDirection.normalize() // Useless with (10, 0, 0) but helpful if we change later
    // raycaster.set(rayOrigin, rayDirection)

    // Position ray to mouse and cast in the direction of camera
    raycaster.setFromCamera(mouse, camera)

    const objectsToTest =[object1, object2, object3]
    // Array of intersections with info such as length of ray to first hit object...
    const intersects = raycaster.intersectObjects(objectsToTest)

    for(const object of objectsToTest){
        object.material.color.set(0xff0000)
    }
    // Intersected to blue
    for(const intersect of intersects){
        intersect.object.material.color.set(0x0000ff)
    }

    // Check if an object is being intersected
    if(intersects.length != 0){
        if(currentIntersect == null){
            console.log("Mouse has entered a sphere")
        }
        currentIntersect = intersects[0]
    }
    else{
        if(currentIntersect != null){
            console.log("Mouse has left a sphere")
        }
        currentIntersect = null
    }



    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()