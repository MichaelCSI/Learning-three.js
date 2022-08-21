import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
// Library for animation
import gsap from 'gsap'

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const gradient3 = textureLoader.load('/textures/gradients/3.jpg')
const gradient5 = textureLoader.load('/textures/gradients/5.jpg')
gradient3.magFilter = THREE.NearestFilter
gradient3.generateMipmaps = false
gradient5.magFilter = THREE.NearestFilter
gradient5.generateMipmaps = false


/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui.addColor(parameters, 'materialColor').onChange(() => {
    material.color.set(parameters.materialColor)
    particleMaterial.color.set(parameters.materialColor)
})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */

// Material
const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradient3
})

// Meshes
const objectDistance = 4
const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60), 
    material
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32), 
    material
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16), 
    material
)
mesh1.position.x = 2
mesh2.position.x = -2
mesh3.position.x = 2

mesh2.position.y = - objectDistance
mesh3.position.y = - objectDistance * 2
scene.add(mesh1, mesh2, mesh3)

const sectionMeshes = [mesh1, mesh2, mesh3]

/**
 * Particle
 */
// Geometry
const particleCount = 200
// X Y Z array for geometry vertices
const positions = new Float32Array(particleCount * 3)
for(let i = 0; i < particleCount; i++){
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * 10
    positions[i3 + 1] = objectDistance* 0.5 - Math.random() * objectDistance * sectionMeshes.length
    positions[i3 + 2] = (Math.random() - 0.5) * 10
}
const particleGeometry = new THREE.BufferGeometry()
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
// Material
const particleMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03,
})
// Points
const particles = new THREE.Points(particleGeometry, particleMaterial)
scene.add(particles)


/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight({ color: 0xaa55ee })
directionalLight.position.set(1, 1, 0)
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
// Group so we can have multiple camera effects
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Scroll and cursor
 */
let scrollY = window.scrollY
let currentSection = 0
window.addEventListener('scroll', () => {
    scrollY = window.scrollY
    const newSection = Math.round(scrollY / sizes.height)
    if(newSection != currentSection){
        currentSection = newSection
        gsap.to(
            sectionMeshes[currentSection].rotation,
            {
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+= 1'
            } 
        )
    }
})

const cursor = new THREE.Vector2()
window.addEventListener('mousemove', (event) => {
    // Cursor is -0.5 t 0.5 on left to right and top to bottom
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})

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

    // Updating objects
    for(const mesh of sectionMeshes){
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12
    }

    // Update camera
    // Convert from a y from top to y from bottom and convert from pixels to our objectDistance
    // Use delta time so as not to make damping faster/slower based on framerate
    camera.position.y = -scrollY / sizes.height * objectDistance

    const parallaxX = cursor.x * 0.5
    const parallaxY = - cursor.y * 0.5
    // Adding damping/inertia to camera to make objects feel natural
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()