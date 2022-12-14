import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

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
 * Models
 */
// gltf is standard, draco is lower size but need to load DRACOLoader and decode compressed file
// Probably use only when file size is large enough, otherwise its marginal

// Put draco from three/examples/js/libs in static
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
// Draco is available in web assembly - can use workers, just need to set DRACOLoader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// Using draco compressed - duck
gltfLoader.load('/models/Duck/glTF-Draco/Duck.gltf', (gltf) => {
    console.log(gltf.scene)
    // // Normal for loop over children takes child away to put into to scene - messes up loop
    // const children = [...gltf.scene.children] // ... takes values - spread operator
    // for(const child of children){
    //     scene.add(child)
    // }
    gltf.scene.rotation.y = - Math.PI / 2
    scene.add(gltf.scene) // Or just add whole scene
})

// Using standard gltf - mask
gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
    console.log(gltf.scene)
    gltf.scene.position.set(-3, 0, 0)
    scene.add(gltf.scene) 
})
// Animation - fox
// Careful: takes a lil time to load mixer so its read as null in tick at first
let mixer = null
gltfLoader.load('/models/Fox/glTF/Fox.gltf', (gltf) => {
    mixer = new THREE.AnimationMixer(gltf.scene)
    const action = mixer.clipAction(gltf.animations[1])
    action.play()

    console.log(gltf.scene)
    gltf.scene.scale.set(0.025, 0.025, 0.025)
    gltf.scene.position.set(3, 0, 0)
    scene.add(gltf.scene) 
})



/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
camera.position.set(0, 2, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update animation mixer
    if(mixer != null){
        mixer.update(deltaTime)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()