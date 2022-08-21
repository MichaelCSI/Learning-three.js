import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()



/**
 * Base
 */
// Debug
const gui = new dat.GUI()
// To contain objects
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Update all materials using traverse - recursively applies to all children
 */
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial){
            child.material.envMapIntensity = debugObject.envMapIntensity
            // Change material when changed - used in gui
            child.material.needsUpdate = true
            // Shadows
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg',
])
// See renderer for explanation (need it here to match textures to renderer)
// Important: :"visible" textures i.e envMap, should have sRGB, linear for others i.e normalMap
// GLTFLoader specifies this automatically
environmentMap.encoding = THREE.sRGBEncoding

scene.background = environmentMap
// Applies envmap to all eligible materials
scene.environment = environmentMap

debugObject.envMapIntensity = 2
gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials)



/**
 * Models
 */
 gltfLoader.load(
    '/models/hamburger.glb',
    (gltf) => {
        gltf.scene.scale.set(0.3, 0.3, 0.3)
        gltf.scene.position.set(0, -1, 0)
        scene.add(gltf.scene)


        gui.add(gltf.scene.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name("rotation y")

        updateAllMaterials()
    }
)


/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(0.25, 3, -2.25)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
// Fix burger shadow acne - test with small values until good - just bias if flat surface
directionalLight.shadow.normalBias = 0.05
scene.add(directionalLight)

// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(directionalLightCameraHelper)

gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name("Dir light intensity")
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001).name("Light x")
gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001).name("Light y")
gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001).name("Light z")
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
camera.position.set(4, 1, - 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    // Set antialiasing to true to get rid of staircases
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// Set lights to "physically correct" - makes importing/exporting values match
renderer.physicallyCorrectLights = true
// Blackbox: output render encoding, linear by default - sRGb makes it look better
// Linear: black to white: 0-1, sRGB deforms values to simulate how eyes see bright
// Normally the values are "squeezed", sRGB "unsqueezes" to re create what its supposed to be
// Can also be achieved with GammaEncoding with gamma factor of 2.2 - agreed upon value
renderer.outputEncoding = THREE.sRGBEncoding
// Tone mapping is meant to convert HDR values black/0 to __ (cuz brightness) into grayscale 0 to 1
// We don't have HDR but using it like this looks good - lots of different types (see below)
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// I think the bug involving this in the vid was fixed (string vs number representation)
gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping
}).onFinishChange(updateAllMaterials)

gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)


/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()