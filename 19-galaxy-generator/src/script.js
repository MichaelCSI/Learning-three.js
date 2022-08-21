import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 360 })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Spiral galaxy - particles
 */
const parameters = {}
parameters.count = 100_000
parameters.size = 0.01
parameters.radius = 7
parameters.branches = 3 
parameters.spin = 1.2
parameters.randomnessPower = 2.25
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'

// Using let null here to destroy them if they already exits when they change in gui
let particlesGeometry = null;
let particlesMaterial = null;
let particles = null;

const generateGalaxy = () => {
    // Destroying possible existing galaxy
    if(particles != null){
        particlesGeometry.dispose()
        particlesMaterial.dispose()
        scene.remove(particles)
    }

    // Geometry
    particlesGeometry = new THREE.BufferGeometry()
    // Material
    particlesMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++){
        // (x, y, z)/(R, G, B) = (i3, i3+1, i3+2)
        const i3 = i * 3

        // POSITION
        // Radius of the galaxy - length of branches, particles appear randomly on branches
        const radius = Math.random() * parameters.radius
        // Angle of the current branch from 0 to 2PI
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
        // Random offset from branch BASED ON RADIUS, to be used as "x offset"
        const spinAngle = radius * parameters.spin

        // Random offset from branch, to be used as "y offset"
        // Using power so as to not have a linear distribution of particles
        // Using sign value at the end to distribute them in the positive and negative: T = 1, F = -1
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) 
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) 
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

        // (cos or sin)(branchAngle) * radius gives lines in for each branch
        // adding spinAngle IN function offsets it "in x" based on how far it is from center(radius)
        // adding random(X/Y/Z) offsets it "in y" to spread it around each branch
        // X
        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
        // Y
        positions[i3 + 1] = randomY
        // Z
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        // COLOR
        // Clone so we don't change original color
        const mixedColor = colorInside.clone()
        // Change color based on radius using lerp - linear interpolation or easing transition
        // radius / parameters.radius gives value from 0 to 1 which control the mix
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // Particles
    particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)
}
generateGalaxy()
// const axes = new THREE.AxesHelper()
// scene.add(axes)

//Adding parameters to gui, use onFinishChange rather than onChange so as not to generate a bunch
gui.add(parameters, 'count').min(0).max(100_000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy).name("particle size")
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

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
camera.position.y = 7
camera.position.z = 10
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
}

tick()