import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import{ TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
//Note can use http://gero3.github.io/facetype.js/ to get online fonts


/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//Axes helper
const axesHelper = new THREE.AxesHelper()
scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matCapTexture = textureLoader.load("/textures/matcaps/1.png")

/**
 * Fonts
 */
//More complicated than textureLoader(imports and path given below)
const fontLoader = new FontLoader()

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json', //this is passed as argument font
    (font) =>
    {
        console.log("Font loaded")

        //Lower curve segments and bevel segments to boost performance
        const textGeometry = new TextGeometry(
            "Michael O'Sullivan",
            {
                font: font,
                size: 0.5,
                height: 0.2,
                curveSegments: 3,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 3
            }
        )
        // //Center the text using its bounding box (not exact due to bevel)
        // //Important: moving geometry not mesh, i.e will now rotate about center
        // textGeometry.computeBoundingBox()
        // //Translate moves whole geometry, all vertices
        // textGeometry.translate(
        //     //Subtract appropriate bevel value to center exactly
        //     (textGeometry.boundingBox.max.x - 0.02)*(-0.5),
        //     (textGeometry.boundingBox.max.y - 0.02)*(-0.5),
        //     (textGeometry.boundingBox.max.z - 0.03)*(-0.5),
        // )
        //Or...
        textGeometry.center()

        const textMaterial = new THREE.MeshMatcapMaterial(
            {map: matCapTexture}
        )
        const text = new THREE.Mesh(textGeometry, textMaterial)
        scene.add(text)

        //Adding donuts for some reason
        //For optimization put whatever you can outside the loop
        //Could go further by using same material for text and donut
        console.time('donuts')
        const donutGeometry = new THREE.TorusBufferGeometry(0.3, 0.2, 20, 45)
        const donutMaterial = new THREE.MeshMatcapMaterial({matcap: matCapTexture})
        for(let i = 0; i < 1000; i++){
            const donut = new THREE.Mesh(donutGeometry, donutMaterial)
            donut.position.x = (Math.random() - 0.5)*20
            donut.position.y = (Math.random() - 0.5)*20
            donut.position.z = (Math.random() - 0.5)*20

            donut.rotation.x = Math.random() * Math.PI
            donut.rotation.y = Math.random() * Math.PI

            const scale = Math.random()
            donut.scale.set(scale, scale, scale)

            scene.add(donut)
        }
        console.timeEnd('donuts')
    }
)

/**
 * Objects
 */


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
camera.position.y = 1
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
}

tick()