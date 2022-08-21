import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

/**
 * Debug
 */
const gui = new dat.GUI()
//Tweaks added below, need to do after creating material

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
//For environment texture
const cubeTextureLoader = new THREE.CubeTextureLoader()

const doorColorTexture = textureLoader.load("/textures/door/color.jpg")
const doorAlphaTexture = textureLoader.load("/textures/door/alpha.jpg")
const doorAmbientOcclusionTexture = textureLoader.load("/textures/door/ambientOcclusion.jpg")
const doorHeightTexture = textureLoader.load("/textures/door/height.jpg")
const doorNormalTexture = textureLoader.load("/textures/door/normal.jpg")
const doorMetalnessTexture = textureLoader.load("/textures/door/metalness.jpg")
const doorRoughnessTexture = textureLoader.load("/textures/door/roughness.jpg")

const matcapTexture = textureLoader.load("/textures/matcaps/4.png")
const gradientTexture = textureLoader.load("/textures/gradients/5.jpg")
gradientTexture.minFilter = THREE.NearestFilter
gradientTexture.magFilter = THREE.NearestFilter
gradientTexture.generateMipmaps = false // Since we're using NearestFilter

//Need to provide 6 for cube, positive x(px), nx, py, ny, pz, nz
const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/3/px.jpg',
    '/textures/environmentMaps/3/nx.jpg',
    '/textures/environmentMaps/3/py.jpg',
    '/textures/environmentMaps/3/ny.jpg',
    '/textures/environmentMaps/3/pz.jpg',
    '/textures/environmentMaps/3/nz.jpg'
])

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Materials
 */
//MeshBasic, basic material, used before
// const material = new THREE.MeshBasicMaterial()
// material.map = doorColorTexture
// material.transparent = true // Needed to change opacity, use alpha map...
// material.alphaMap = doorAlphaTexture
// material.side = THREE.DoubleSide // See both sides of a plane, inside of cube...

//MeshNormal, colors mesh normals, used to debug normals or for cool colors
// const material = new THREE.MeshNormalMaterial()
// material.flatShading = true

//MeshMatcap colors mesh using normals based on how a sphere should look
// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matcapTexture

//MeshDepth colors mesh in white if close and black if far(values of camera)
// const material = new THREE.MeshDepthMaterial()

//MeshLambert reacts to light, not demanding on performance(low quality)
// const material = new THREE.MeshLambertMaterial()

//MeshPhong is like MeshLambert but reflects and no obvious light lines
// const material = new THREE.MeshPhongMaterial()
// material.shininess = 100
// material.specular = new THREE.Color(0x1188ff)

//MeshToon is like a cartoon, similar to MeshLambert
// const material = new THREE.MeshToonMaterial()
// material.gradientMap = gradientTexture // Adds more steps to coloration
//Causes merging due to small gradient - magFilter tries to "fix" w/ minmapping
//Set minFilter and magFilter to NearestFilter(above), like minecraft block (11)

//MeshStandard - maybe most useful, physically based rendering principals(PBR)
//Like MeshLamber and MeshPhong but adds extra like metalness, roughness...
// const material = new THREE.MeshStandardMaterial()
// // material.metalness = 0.7
// // material.roughness = 0.2
// material.map = doorColorTexture
// //To add ambient occlusion (maps where texture is dark), need second set of UV
// //Called "uv2", added below respective object
// material.aoMap = doorAmbientOcclusionTexture
// material.aoMapIntensity = 5
// //Displacement map moves vertices to create relief, uses displacement/height map
// //Not enough vertices or too strong displacement means it will be a mess
// material.displacementMap = doorHeightTexture
// material.displacementScale = 0.05
// //Also using metalness and roughness maps, don't combine with set values
// material.metalnessMap = doorMetalnessTexture
// material.roughnessMap = doorRoughnessTexture
// //Adding normal map for detail
// material.normalMap = doorNormalTexture
// material.normalScale.set(0.5, 0.5)
// //Adding alpha texture to remove sides
// material.transparent = true
// material.alphaMap = doorAlphaTexture

//MeshPhysical is like MeshStander except supports clear coat effect, like paint
//Points for particles, will see later
//Shader and RawShader can be used to create materials, will see later

//Environment Map surrounds the scene for general lighting - like hdri
//Can download hdri and convert using online HDRI-to-CubeMap tool
//https://matheowis.github.io/HDRI-to-CubeMap/
//At the moment only supports cube maps
const material = new THREE.MeshStandardMaterial()
material.metalness = 1
material.roughness = 0
material.envMap = environmentMapTexture

//GUI
gui.add(material, 'metalness').min(0).max(1).step(0.0001)
gui.add(material, 'roughness').min(0).max(1).step(0.0001)
gui.add(material, 'aoMapIntensity').min(0).max(10).step(0.0001)
gui.add(material, 'displacementScale').min(0).max(1).step(0.0001)



/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.x = 2
pointLight.position.y = 2
pointLight.position.z = 4
scene.add(ambientLight, pointLight)

/**
 * Objects
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 64, 64),
    material
)
sphere.position.x = -1.2
sphere.geometry.setAttribute('uv2', 
    new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2)
)

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 100, 100),
    material
)
plane.geometry.setAttribute('uv2', 
new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2)
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 64, 128),
    material
)
torus.position.x = 1.2
torus.geometry.setAttribute('uv2', 
    new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2)
)
scene.add(sphere, plane, torus)

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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Rotate objects
    // sphere.rotation.y = 0.1 * elapsedTime
    // plane.rotation.y = 0.1 * elapsedTime
    // torus.rotation.y = 0.1 * elapsedTime
    // sphere.rotation.x = 0.1 * elapsedTime
    // plane.rotation.x = 0.1 * elapsedTime
    // torus.rotation.x = 0.1 * elapsedTime

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()