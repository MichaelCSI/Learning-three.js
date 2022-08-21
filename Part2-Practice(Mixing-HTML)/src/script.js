import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const minecraft = textureLoader.load('/textures/minecraft.png')
minecraft.minFilter = THREE.NearestFilter
minecraft.magFilter = THREE.NearestFilter
minecraft.generateMipmaps = false


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * GUI parameters
 */
 const parameters = {
    starColor: 0xffffff,
    blackHoleIn: 0xffa500,
    blackHoleOut: 0xe6b8ff,
    blackHoleRadius: 0.6
}

/**
 * Objects
 */

// Blackhole center
const blackHoleGroup = new THREE.Group()
blackHoleGroup.position.set(3, 1, -4)
blackHoleGroup.scale.set(2, 2, 1)
scene.add(blackHoleGroup)

let blackHoleCenterGeometry = null
let blackHoleCenterMaterial = null
let blackHoleCenter = null
const generateBlackHoleCenter = () => {
    if(blackHoleCenter != null){
        blackHoleCenterGeometry.dispose()
        blackHoleCenterMaterial.dispose()
        blackHoleGroup.remove(blackHoleCenter)
    }
    blackHoleCenterGeometry = new THREE.CircleGeometry(parameters.blackHoleRadius / 2, 32)
    blackHoleCenterMaterial = new THREE.MeshBasicMaterial( {color: 0x000000 })
    blackHoleCenter = new THREE.Mesh(blackHoleCenterGeometry, blackHoleCenterMaterial)
    blackHoleGroup.add(blackHoleCenter)
}
generateBlackHoleCenter()

// Space objects
const spaceObjects = new THREE.Group()
scene.add(spaceObjects)
const boxMaterial = new THREE.MeshBasicMaterial({
    map: minecraft,
})
const boxGeometry = new THREE.BoxBufferGeometry(0.3, 0.3, 0.3)
const box1 = new THREE.Mesh(boxGeometry, boxMaterial)
box1.position.set(4, -1, -5)
const box2 = new THREE.Mesh(boxGeometry, boxMaterial)
box2.position.set(-0.5, 0.5, -2)
const box3 = new THREE.Mesh(boxGeometry, boxMaterial)
box3.position.set(-2, 0, 3)
const box4 = new THREE.Mesh(boxGeometry, boxMaterial)
box4.position.set(0.5, -0.5, 2)
spaceObjects.add(box1, box2, box3, box4)
const spaceObjectsArray = [box1, box2, box3, box4]




/**
 * Particles
 */

// Stars
const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial( {
    size: 0.02,
    sizeAttenuation: true,
    color: parameters.starColor
})

const starCount = 1000
const starPositions = new Float32Array(starCount * 3)

for(let i = 0; i < starCount; i++){
    const i3 = i * 3
    starPositions[i3] = (Math.random() - 0.5) * 12
    starPositions[i3 + 1] = (Math.random() - 0.5) * 3 + 0.3
    starPositions[i3 + 2] = (Math.random() - 0.7) * 8
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
const stars = new THREE.Points(starGeometry, starMaterial)
scene.add(stars)


// Blackhole
let blackHoleGeometry = null
let blackHoleMaterial = null
let blackHole = null

const blackHoleCount = 10_000
const blackHolePositions = new Float32Array(blackHoleCount * 3)
const blackHoleColors = new Float32Array(blackHoleCount * 3)
const generateBlackHole = () => {
    // Replace possible existing blackhole
    if(blackHole != null){
        blackHoleGeometry.dispose()
        blackHoleMaterial.dispose()
        blackHoleGroup.remove(blackHole)
    }

    blackHoleGeometry = new THREE.BufferGeometry()
    blackHoleMaterial = new THREE.PointsMaterial( {
        size: 0.02,
        sizeAttenuation: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending
    })

    for(let i = 0; i < blackHoleCount; i++){
        const i3 = i * 3
        let radius = Math.random() * parameters.blackHoleRadius
        // Round particles to innner or outer area
        const halfRadius = parameters.blackHoleRadius / 2
        const fullRadius = parameters.blackHoleRadius 
        const inner = Math.random() * (halfRadius - halfRadius / 2) + halfRadius / 2
        const outer = Math.random() * (fullRadius - fullRadius * 0.9) + fullRadius * 0.9
        radius = radius < fullRadius * 0.75 ? inner : outer

        const randomPos = Math.random() * Math.PI * 2
        

        blackHolePositions[i3] = Math.sin(randomPos) * radius
        blackHolePositions[i3 + 1] = Math.cos(randomPos) * radius
        blackHolePositions[i3 + 2] = 0.01
        
        const mixColor = new THREE.Color(parameters.blackHoleIn).clone()
        mixColor.lerp(new THREE.Color(parameters.blackHoleOut), radius * 1.5)
        blackHoleColors[i3] = mixColor.r
        blackHoleColors[i3 + 1] = mixColor.g
        blackHoleColors[i3 + 2] = mixColor.b
    }

    blackHoleGeometry.setAttribute('position', new THREE.BufferAttribute(blackHolePositions, 3))
    blackHoleGeometry.setAttribute('color', new THREE.BufferAttribute(blackHoleColors, 3))
    blackHole = new THREE.Points(blackHoleGeometry, blackHoleMaterial)
    blackHoleGroup.add(blackHole)
}
generateBlackHole()


/**
 * Debug
 */
 const gui = new dat.GUI()

 const starsFolder = gui.addFolder("Stars").close()
 starsFolder.addColor(parameters, 'starColor').onChange(() => {
     starMaterial.color.set(parameters.starColor)
 })

 const blackHoleFolder = gui.addFolder("Blackhole").close()
 blackHoleFolder.addColor(parameters, 'blackHoleIn').onFinishChange(generateBlackHole)
 blackHoleFolder.addColor(parameters, 'blackHoleOut').onFinishChange(generateBlackHole)
 blackHoleFolder.add(parameters, 'blackHoleRadius').min(0.5).max(1).step(0.001).onFinishChange(() => {
     generateBlackHole()
     generateBlackHoleCenter()
 })



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
const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 6)
scene.add(camera)

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
 * Scroll and cursor / animations
 */
let scrollY = window.scrollY
let currentSection = 0
const animationOne = gsap.timeline()
animationOne.pause()
const scaleX = 80
const scaleY = 80
const shiftY = 100
const shiftX = 400
animationOne.to(".animation", { duration: 0.01, opacity: 100 })
animationOne.to(".animation", { duration: 1, scaleY: scaleY })
animationOne.to(".animation", { duration: 0.5, rotationZ: 90 })
animationOne.to("#two", { duration: 0.5, y: shiftY, ease: "power1" })
animationOne.to("#three", { duration: 1, y: shiftY * 2 }, "<")
animationOne.to("#two", { duration: 0.7, x: shiftX, ease: "power1" })
animationOne.to("#three", { duration: 1, x: shiftX * 2, ease: "power1" }, "<")
animationOne.to(".animation", { duration: 1, scaleX: scaleX })


window.addEventListener('scroll', () => {
    scrollY = window.scrollY
    // Sections of page 0 to n depending on html
    const newSection = Math.round(scrollY / sizes.height * 3)

    // Projects section animation activates on scrolling down or up to it
    if(newSection == 3 && currentSection == 2 || newSection == 4 && currentSection == 5){
        currentSection = newSection
        animationOne.play()
    }
    // Projects section animation reverse on scrolling down or up away from it
    else if(newSection == 6 && currentSection == 5 || newSection == 2 && currentSection == 3){
        currentSection = newSection
        animationOne.reverse()        
    }
    else if(newSection != currentSection){
        currentSection = newSection
    }
})
if(currentSection == 2){
    animationOne.play(0)
}



/**
 * Animate frames
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Updating objects
    for(const mesh of spaceObjectsArray){
        mesh.rotation.x = elapsedTime * 0.1
        mesh.rotation.y = elapsedTime * 0.08
    }
    spaceObjects.rotation.y = elapsedTime * 0.1


    // Update particles
    stars.rotation.y = elapsedTime * 0.05
    blackHoleGroup.rotation.x = Math.cos(elapsedTime) * 0.05
    blackHoleGroup.rotation.y = Math.sin(elapsedTime) * 0.05
    

    // Update camera
    camera.position.y = -scrollY / sizes.height * 3

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()