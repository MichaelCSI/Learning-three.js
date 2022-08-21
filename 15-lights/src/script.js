import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'

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
//Low cost lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
const hemisphereLight = new THREE.HemisphereLight(0x2222ff, 0xff2222, 0)

//Mid cost lights
const directionalLight = new THREE.DirectionalLight(0x00ffff, 0);
directionalLight.position.set(0, 0, -2)
const pointLight = new THREE.PointLight(0xff9000, 0)
pointLight.position.set(0, 0, 2)

//Hight cost lights
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 0, 2, 2)
rectAreaLight.position.set(3, 0, 0)
rectAreaLight.rotation.y = Math.PI/2
const spotLight = new THREE.SpotLight(0x78ff00, 0, 10, Math.PI*0.1, 0.25, 1)
spotLight.position.set(-5, 2, 0)
spotLight.rotation.y = -Math.PI/2
//spotLight.target.position.x = 0

scene.add(
    ambientLight, directionalLight, 
    hemisphereLight, pointLight, 
    rectAreaLight, spotLight, spotLight.target
)

//Light helpers
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2)
hemisphereLightHelper.visible = false
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
directionalLightHelper.visible = false
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
pointLightHelper.visible = false
//Rect helper imported
const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight)
rectAreaLightHelper.visible = false
const spotLightHelper = new THREE.SpotLightHelper(spotLight)
spotLightHelper.visible = false

scene.add(
    hemisphereLightHelper, directionalLightHelper, 
    pointLightHelper, rectAreaLightHelper, spotLightHelper
)

//DAT GUI for Lights and Light Helpers
const ambLight = gui.addFolder('Ambient Light').close()
ambLight.add(ambientLight, 'intensity').min(0).max(1).step(0.001).name("Intensity")

const hemLight = gui.addFolder('Hemisphere Light').close()
hemLight.add(hemisphereLight, 'intensity').min(0).max(1).step(0.001).name("Intensity")
hemLight.add(hemisphereLightHelper, 'visible').name("Gizmo")

const dirLight = gui.addFolder('Directional Light').close()
dirLight.add(directionalLight, 'intensity').min(0).max(1).step(0.001).name("Intensity")
dirLight.add(directionalLight.position, 'y').min(-1).max(3).step(0.001).name("Y")
dirLight.add(directionalLightHelper, 'visible').name("Gizmo")

const poiLight = gui.addFolder('Point Light').close()
poiLight.add(pointLight, 'intensity').min(0).max(1).step(0.001).name("Intensity")
poiLight.add(pointLight.position, 'y').min(-1).max(3).step(0.001).name("Y")
poiLight.add(pointLight, 'distance').min(0).max(10).step(0.001).name("Distance")
poiLight.add(pointLight, 'decay').min(0).max(10).step(0.001).name("Decay")
poiLight.add(pointLightHelper, 'visible').name("Gizmo")

const rectLight = gui.addFolder('Rectangle Light').close()
rectLight.add(rectAreaLight, 'intensity').min(0).max(1).step(0.001).name("Intensity")
rectLight.add(rectAreaLight, 'width').min(0).max(5).step(0.001).name("Width")
rectLight.add(rectAreaLight, 'height').min(0).max(5).step(0.001).name("Height")
rectLight.add(rectAreaLight.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name("Y Rotation")
rectLight.add(rectAreaLightHelper, 'visible').name("Gizmo")

const spoLight = gui.addFolder('Spot Light').close()
spoLight.add(spotLight, 'intensity').min(0).max(1).step(0.001).name("Intensity")
spoLight.add(spotLight, 'distance').min(0).max(10).step(0.001).name("Distance")
spoLight.add(spotLight, 'decay').min(0).max(10).step(0.001).name("Decay")
spoLight.add(spotLight, 'angle').min(0).max(Math.PI).step(0.001).name("Angle")
spoLight.add(spotLight, 'penumbra').min(0).max(4).step(0.001).name("Penumbra")
//As you move along the x axis and the target stays put, it appears to rotate on Z-axis
spoLight.add(spotLight.position, 'x').min(-5).max(5).step(0.001).name("Y rotation")
spoLight.add(spotLight.target.position, 'x').min(-5).max(5).step(0.001).name("Target x")
spoLight.add(spotLightHelper, 'visible').name("Gizmo")




/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.position.x = - 1.5

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65

scene.add(sphere, cube, torus, plane)

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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
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

    //Update Lights
    window.requestAnimationFrame(() =>{
        spotLightHelper.update()
    })

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    cube.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    cube.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()