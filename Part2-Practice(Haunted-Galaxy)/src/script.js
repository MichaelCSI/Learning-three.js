// Merging Three.js lessons 17, 19: haunted house and galaxy generator

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

//Three.js supports fog as Fog class, distance values are relative to camera
const fog = new THREE.Fog(0x262837, 1, 15)
scene.fog = fog

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

//Door textures for door
const doorColorTexture = textureLoader.load('/textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg')
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg')
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg')

//Brick textures for walls
const bricksColorTexture = textureLoader.load('/textures/bricks/color.jpg')
const bricksAmbientOcclusionTexture = textureLoader.load('/textures/bricks/ambientOcclusion.jpg')
const bricksNormalTexture = textureLoader.load('/textures/bricks/normal.jpg')
const bricksRoughnessTexture = textureLoader.load('/textures/bricks/roughness.jpg')

//Grass texture for floor
const grassColorTexture = textureLoader.load('/textures/grass/color.jpg')
const grassAmbientOcclusionTexture = textureLoader.load('/textures/grass/ambientOcclusion.jpg')
const grassNormalTexture = textureLoader.load('/textures/grass/normal.jpg')
const grassRoughnessTexture = textureLoader.load('/textures/grass/roughness.jpg')
//Need to repeat because as is the texture is to zoomed in
grassColorTexture.repeat.set(16, 16)
grassAmbientOcclusionTexture.repeat.set(16, 16)
grassNormalTexture.repeat.set(16, 16)
grassRoughnessTexture.repeat.set(16, 16)
//By default textures don't repeat and just extend the last pixels so repeat on s and t
grassColorTexture.wrapS = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
grassNormalTexture.wrapS = THREE.RepeatWrapping
grassRoughnessTexture.wrapS = THREE.RepeatWrapping

grassColorTexture.wrapT = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
grassNormalTexture.wrapT = THREE.RepeatWrapping
grassRoughnessTexture.wrapT = THREE.RepeatWrapping


/**
 * House
 */
//Group is similar to parenting
const house = new THREE.Group()
scene.add(house)

//Walls
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4), 
    new THREE.MeshStandardMaterial({
        map: bricksColorTexture,
        aoMap: bricksAmbientOcclusionTexture,
        normalMap: bricksNormalTexture,
        roughnessMap: bricksRoughnessTexture
    })
)
//Need second uv for ambient occlusion
walls.geometry.setAttribute(
    'uv2', 
    new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
)
walls.position.y = 1.25
house.add(walls)

//Roof
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1, 4),
    new THREE.MeshStandardMaterial({ color: 0xb35f45 })
)
roof.rotation.y = Math.PI * 0.25
roof.position.y = 2.5 + 1/2 
house.add(roof)

//Door
const door = new THREE.Mesh(
    //Adding subdivisions to show displacement
    new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
    new THREE.MeshStandardMaterial({ 
        map: doorColorTexture,
        // Bug with particle visibility due to alpha map
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.1,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture
    })
)
//Need second uv for ambient occlusion
door.geometry.setAttribute(
    'uv2', 
    new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
)
door.position.y = 1
door.position.z = 2 + 0.01
house.add(door)

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ 
        map: grassColorTexture,
        aoMap: grassAmbientOcclusionTexture,
        normalMap: grassNormalTexture,
        roughnessMap: grassRoughnessTexture
     })
)
//Need second uv for ambient occlusion
floor.geometry.setAttribute(
    'uv2', 
    new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
)
floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0
scene.add(floor)


//Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x89c854 })

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(0.8, 0.2, 2.2)
const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.4, 0.1, 2.1)
const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(-0.8, 0.1, 2.2)
const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.scale.set(0.15, 0.15, 0.15)
bush4.position.set(-1, 0.05, 2.6)
house.add(bush1, bush2, bush3, bush4)


//Graves
const graves = new THREE.Group()
scene.add(graves)

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({ color: 0xb2b6b1 })
//Making graves appear in a circle around the house on the plane
for(let i = 0; i < 50; i++){
    //x and z are values from (-1 to 1)*(4 to 9)
    const angle = Math.random() * Math.PI*2
    const radius = 4 + Math.random()*5
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius

    const grave = new THREE.Mesh(graveGeometry, graveMaterial)
    grave.position.set(x, 0.3, z)
    grave.rotation.y = (Math.random() - 0.5) * 0.4
    grave.rotation.z = (Math.random() - 0.5) * 0.4
    grave.castShadow = true
    graves.add(grave)
}

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.12)
moonLight.position.set(4, 5, - 2)
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001)
gui.add(moonLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(moonLight)

//Door light
const doorLight = new THREE.PointLight(0xff7d46, 1, 7)
doorLight.position.set(0, 2.2, 2.7)
house.add(doorLight)

/**
 * Ghosts
 */
const ghost1 = new THREE.PointLight(0xff00ff, 2, 3)
const ghost2 = new THREE.PointLight(0x00ffff, 2, 3)
const ghost3 = new THREE.PointLight(0xffff00, 2, 3)
scene.add(ghost1, ghost2, ghost3)

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
 
         // Random offset from branch
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
         positions[i3 + 1] = randomY + 5
         // Z
         positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ
         console.log(positions[i3] + ", " + positions[i3+1] + ", " + positions[i3+2])
 
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
camera.position.set(0, 1, 10)
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
//In order to hide edges of scene, set ClearColor/background to the same color as fog
renderer.setClearColor(0x262837)

/**
 * Shadows
 */
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

moonLight.castShadow = true
doorLight.castShadow = true
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true

walls.castShadow = true
bush1.castShadow = true
bush2.castShadow = true
bush3.castShadow = true
bush4.castShadow = true
//Graves done in grave creation
floor.receiveShadow = true

//Modifying shadows
doorLight.shadow.mapSize.width = 256
doorLight.shadow.mapSize.height = 256
doorLight.shadow.camera.far = 7

ghost1.shadow.mapSize.width = 256
ghost1.shadow.mapSize.height = 256
ghost1.shadow.far = 7
ghost2.shadow.mapSize.width = 256
ghost2.shadow.mapSize.height = 256
ghost2.shadow.far = 7
ghost3.shadow.mapSize.width = 256
ghost3.shadow.mapSize.height = 256
ghost3.shadow.far = 7


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Animating ghosts
    //Ghost 1 is a consistent circle with consistent up/down
    const ghost1Angle = elapsedTime * 0.5
    const ghost1Radius = 4
    ghost1.position.x = Math.sin(ghost1Angle) * ghost1Radius
    ghost1.position.z = Math.cos(ghost1Angle) * ghost1Radius
    ghost1.position.y = Math.sin(ghost1Angle * 3)

    //Ghost 2 is a consistent circle with inconsistent up/down
    const ghost2Angle = - elapsedTime * 0.3
    const ghost2Radius = 5
    ghost2.position.x = Math.sin(ghost2Angle) * ghost2Radius
    ghost2.position.z = Math.cos(ghost2Angle) * ghost2Radius
    ghost2.position.y = Math.sin(ghost2Angle * 3) + Math.sin(ghost2Angle * 2.5)

    //Ghost 3 is an inconsistent circle with incosistent up/down
    const ghost3Angle = - elapsedTime * 0.2
    const ghost3Radius = 7 + Math.sin(elapsedTime * 0.3)
    ghost3.position.x = Math.sin(ghost3Angle) * ghost3Radius
    ghost3.position.z = Math.cos(ghost3Angle) * ghost3Radius
    ghost3.position.y = Math.sin(ghost3Angle * 4) + Math.sin(ghost3Angle * 2.5)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    particles.rotation.y = elapsedTime * 0.1

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()