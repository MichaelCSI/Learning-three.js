// Thanks to Bruno Simon/Three.js Journey for teaching the concepts displayed here

import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import * as dat from 'lil-gui'

/**
 * Imports
 * Canvas, scene
 * Textures, materials, fonts/text, objects, lights
 * Window size, camera, controls, renderer, functions/animate
 */
// Debug
const gui = new dat.GUI({ width: 360 })
//Canvas
const canvas = document.querySelector('canvas.webgl')
//Scene
const scene = new THREE.Scene()
//scene.background = new THREE.Color(0x222222)


//Textures
const textureLoader = new THREE.TextureLoader()
const matCap3Texture = textureLoader.load('/textures/matcaps/3.png')
const matCap4Texture = textureLoader.load('/textures/matcaps/4.png')
const matCap8Texture = textureLoader.load('/textures/matcaps/8.png')
const gradientTexture = textureLoader.load('/textures/gradients/5.jpg')
gradientTexture.minFilter = THREE.NearestFilter
gradientTexture.magFilter = THREE.NearestFilter
gradientTexture.generateMipmaps = false
const minecraftTexture = textureLoader.load('/textures/minecraft.png')
minecraftTexture.minFilter = THREE.NearestFilter
minecraftTexture.magFilter = THREE.NearestFilter
minecraftTexture.generateMipmaps = false

const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/1/px.jpg',
    '/textures/environmentMaps/1/nx.jpg',
    '/textures/environmentMaps/1/py.jpg',
    '/textures/environmentMaps/1/ny.jpg',
    '/textures/environmentMaps/1/pz.jpg',
    '/textures/environmentMaps/1/nz.jpg'
])

//Materials
const matCap3 = new THREE.MeshMatcapMaterial({ matcap: matCap3Texture })
const matCap8 = new THREE.MeshMatcapMaterial({ matcap: matCap8Texture })
const diamond = new THREE.MeshBasicMaterial({ map: minecraftTexture })

const env = new THREE.MeshStandardMaterial()
env.envMap = environmentTexture
env.metalness = 1
env.roughness = 0
env.side = THREE.DoubleSide

const surround = new THREE.MeshMatcapMaterial({ color: 0xffffbb, matcap: matCap4Texture})
surround.side = THREE.DoubleSide

const toon = new THREE.MeshToonMaterial({ color: 0xc48b5d })
toon.gradientMap = gradientTexture



//Fonts/text
const fontLoader = new FontLoader()
fontLoader.load('/fonts/gentilis_bold.typeface.json', (font) => {
    const textGeometry = new TextGeometry("Michael O'Sullivan", {
        font: font,
        size: 0.6,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    })
    textGeometry.center()
    const text = new THREE.Mesh(textGeometry, matCap3)
    text.position.z = 1
    scene.add(text)
})



//Objects
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), env)
//const sphere = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), matCap3)
sphere.position.y = 1
scene.add(sphere)

const diamondBlock = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), diamond)
diamondBlock.position.y = 1
diamondBlock.position.x = -2.5
scene.add(diamondBlock)

const donut = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.3, 32, 32), toon)
donut.position.y = 1
donut.position.x = 2.5
scene.add(donut)

const outer = new THREE.Mesh(new THREE.SphereGeometry(8, 64, 64), surround)
//scene.add(outer)


//Lights
const ambientLight = new THREE.AmbientLight()
const pointLight = new THREE.PointLight()
pointLight.intensity = 0.1
scene.add(ambientLight, pointLight)

/**
* Spiral galaxy - particles
*/
const parameters = {}
parameters.count = 100_000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 3 
parameters.spin = 1.2
parameters.rotationVelocity = 1
parameters.randomnessPower = 3
parameters.spiralHeight = 0.5
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
        positions[i3 + 1] = randomY + radius * parameters.spiralHeight + 3
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
    particles.rotation.x = -Math.PI * 0.1
    scene.add(particles)
}
generateGalaxy()
// Adding parameters to gui, use onFinishChange rather than onChange so as not to generate a bunch
const galaxy = gui.addFolder("Galaxy")
galaxy.add(parameters, 'count').min(0).max(100_000).step(100).onFinishChange(generateGalaxy)
galaxy.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy).name("particle size")
galaxy.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
galaxy.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
galaxy.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
galaxy.add(parameters, 'rotationVelocity').min(-3).max(3)
galaxy.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
galaxy.add(parameters, 'spiralHeight').min(-parameters.radius).max(parameters.radius).step(0.001).onFinishChange(generateGalaxy)
galaxy.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
galaxy.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)


//Sizes of window
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
//Window resize
window.addEventListener('resize', () =>{
    //Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    //Update camera
    camera.aspect = sizes.width/sizes.height
    camera.updateProjectionMatrix()
    
    //Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})



//Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height, 0.1, 100)
camera.position.y = 2
camera.position.z = 8
camera.rotation.x = Math.PI * 0.5
scene.add(camera)

//Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.target.set(0, 1, 0)

//Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



//Animate
const clock = new THREE.Clock()
const tick = () =>{
    const elapsedTime = clock.getElapsedTime();
    const sin = Math.sin(elapsedTime)
    const cos = Math.cos(elapsedTime)
    const rand = Math.random()-0.5

    //Update controls
    controls.update()
    
    //Update renderer
    renderer.render(scene, camera)

    //Updating objects
    sphere.position.x = sin

    diamondBlock.rotation.x -= 0.001
    diamondBlock.rotation.y += 0.005

    donut.rotation.x -= 0.005
    donut.rotation.y += 0.005

    // Updating galaxy/particles
    particles.rotation.y += parameters.rotationVelocity * 0.001

    //Repeat next frame
    window.requestAnimationFrame(tick)
}
tick()