import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { CameraHelper } from 'three'


/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
//Boost quality, performance: similar to light baking, you can bake shadows, not dynamic
const bakedShadow = textureLoader.load('textures/bakedShadow.jpg')
//Dynamic plane shadow texture, not as nice but a solid middleground, dynamic
//Plane with black shadow texture, transparent elsewhere, follows object
const simpleShadow = textureLoader.load('textures/simpleShadow.jpg')


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
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3)
directionalLight.position.set(2, 2, - 1)
gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001)
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(directionalLight)

//Making directional light cast shadows
directionalLight.castShadow = true
//To get a nicer shadow map, must increase resolution(default 512 x 512)
directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024
//Changing near and far can help avoid unintended shadows/bug
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 6
//Change camera size to not render a big shadow map, improves quality, careful to not crop shadow
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.right = 2
directionalLight.shadow.camera.bottom = -2
directionalLight.shadow.camera.left = -2
//Can change shadow blur - careful, this is a static value and doesn't work with soft shadow
directionalLight.shadow.radius = 10
//We can use the camera helper to debug, it is an orthographic camera
const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
//scene.add(directionalLightCameraHelper)

//Spotlight - shadow uses perspective camera
const spotLight = new THREE.SpotLight(0xffffff, 0.2, 10, Math.PI*0.3)
spotLight.castShadow = true
spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024
spotLight.shadow.camera.fov = 30
spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 6

spotLight.position.set(0, 2, 2)
scene.add(spotLight)
scene.add(spotLight.target)

const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
//scene.add(spotLightCameraHelper)

//Point light - uses multiple perspective cameras to render a cube(no fov) - 6 renders, expensive
const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.castShadow = true
pointLight.position.set(-1, 1, 0)
pointLight.shadow.mapSize.width = 1024
pointLight.shadow.mapSize.height = 1024
pointLight.shadow.camera.near = 0.1
pointLight.shadow.camera.far = 3
scene.add(pointLight)

const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
//scene.add(pointLightCameraHelper)

/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
gui.add(material, 'metalness').min(0).max(1).step(0.001)
gui.add(material, 'roughness').min(0).max(1).step(0.001)

/**
 * Objects
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
//Making sphere cast shadow
sphere.castShadow = true

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 10),
    material
    // //Making use of our static baked shadow map
    // new THREE.MeshBasicMaterial({
    //     map: bakedShadow
    // })
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5
//Making plane receive shadows
plane.receiveShadow = true

scene.add(sphere, plane)

//Shadow plane: shadow as alphaMap, stays below the sphere
const sphereShadow = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1.5, 1.5, 1.5),
    new THREE.MeshBasicMaterial({
        color: 0x000000,
        alphaMap: simpleShadow,
        transparent: true
    })
)
sphereShadow.rotation.x = -(Math.PI * 0.5)
sphereShadow.position.y = plane.position.y+0.01
scene.add(sphereShadow)

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
camera.position.x = 5
camera.position.y = 3
camera.position.z = 7
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

//Shadow maps 
renderer.shadowMap.enabled = false
//SoftShadow improves quality, default PCFShadowMap
renderer.shadowMap.type = THREE.PCFSoftShadowMap

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Update the sphere - circles and bouncing
    sphere.position.x = Math.sin(elapsedTime)
    sphere.position.z = 3*Math.cos(elapsedTime)
    sphere.position.y = Math.abs(Math.sin(elapsedTime*3))
    //Update the sphere's shadow
    sphereShadow.position.x = sphere.position.x
    sphereShadow.position.z = sphere.position.z
    //Change opacity for height
    sphereShadow.material.opacity = 1 - sphere.position.y*0.2

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()