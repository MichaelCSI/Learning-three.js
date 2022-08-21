//Particle pack: https://www.kenney.nl/assets/particle-pack

import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const starTexture = textureLoader.load('/textures/particles/11.png')
const circleTexture = textureLoader.load('/textures/particles/2.png')


/**
 * Partricles
 */
//Geometry
// //Using sphere for particle layout
// const particlesGeometry = new THREE.SphereBufferGeometry(1, 32, 32)

//Using random geometry for particle layout
const particlesGeometry = new THREE.BufferGeometry()
//C vertices, each with x, y, z so C*3 values
const count = 50_000
const positions = new Float32Array(count * 3)
const colors = new Float32Array(count * 3)

for(let i = 0; i < count*3; i++){
    //x, y, z, on -10 to 10
    positions[i] = (Math.random() - 0.5) * 10
    //R, G, B, on 0 to 1
    colors[i] = Math.random()
}
//Sets positions/vertices to each group of 3 from our xyz positions array
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
//Sets colors
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

//Material
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true,
    //color: '#ff88cc', //If we keep base color, it will mix with vertex colors
    vertexColors: true,
    map: circleTexture,
    //To see particles behind, need alpha, but still see edges due to WebGL uncertainty:
    //Particles are drawn in the same order as they are created - not sure which is in in front/back
    transparent: true,
    alphaMap: circleTexture,
})
//Alpha fixes - can also set these in initialization i.e alphaTest: 0.001

//Alpha test - by default gpu renders alpha map 0(black) pixels, we will say don't render it
//particlesMaterial.alphaTest = 0.001 //Good fix but black edges of visible shape are still drawn

//Depth test - teset if what's being drawn is closer than what is already drawn
//particlesMaterial.depthTest = false //Draw everything, but creates bug: see particles behind opaque

//Depth write - depth of what's being drawn is stored in depth buffer: don't draw particles in buffer
particlesMaterial.depthWrite = false //Like deactivating depth test but without opaque bug

//Blending: unlike other tests - different result, affects performance - note: keep depthWrite
//WebGL by default draws pixels on top of each other, can say to add the colors of pixels instead
particlesMaterial.blending = THREE.AdditiveBlending //More visible with lots of particles - glows

//Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)


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

    // Animating particles
    // particles.rotation.y = elapsedTime * 0.2
    // particles.position.y = -elapsedTime * 0.2

    // Can access each particle using position attribute of BufferGeometry
    // This is a lot of work for the GPU, bad idea to update the whole attribute on each frame
    // The right way is making a custom material with a custom shader
    for(let i = 0; i < count; i++){
        // Groups of xyz, x = i3, y = i3+1, z = i3+2
        const i3 = i * 3

        // Use x position to offset y movement
        const x = particlesGeometry.attributes.position.array[i3]
        particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x)
    }
    // Three.js needs to be notificed when a geometry attribute changes
    particlesGeometry.attributes.position.needsUpdate = true
}

tick()