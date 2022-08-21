import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Vector2 } from 'three';

/**
 * Textures
 * When preparing, keep in mind: 
 * Weight: 
 *      -jpg(possible loss in compression but usually lighter) or png(no loss but usually heavier)
 *      -Can use compression website/software like TinyPNG
 * Size/resolution
 *      -Try to reduce the size, i.e no mipmapping with NearestFilter(like below)
 *      -Use smaller texture for stuff we won't really see
 *      -Note for mipmapping, divides texture until 1x1 pixel, use size 2^n (even numbers)
 * Data
 *      -Textures support transparency but not for jpg(need alpha jpg alongside it), 2 jpg vs 1 png
 *      -For files like normal where exact coordinates are used, usually use png(lossless)
 *      -Can combine data into one texture by using rgb and alpha channels seperately
 *              -Use different color for border, image, shadow, elevation, etc..., will see later
 * Find right combo of texture format and resolution for performance
 * Some texture websites: polligon, 3dtextures, arroway-textures...
 * Can make textures with photos, photoshop, substance designer
 * Make sure you have the right to use the image!
 */
//Importing with native js
// const image = new Image()
// const texture = new THREE.Texture(image);
// image.onload = () =>{
       //When the image is ready, update texture
//     texture.needsUpdate = true; 
// }
// image.src = '/textures/door/color.jpg'

//Using Three js
//LoadingManager mutualizes loads, useful for loading progress of all models, all loaded, etc...
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = () => {
    console.log("onStart");
}
loadingManager.onProgress = () => {
    console.log("onProgress");
}
loadingManager.onLoad = () => {
    console.log("onLoad");
}
loadingManager.onError = () => {
    console.log("onError");
}
//Using Three's TextureLoader class, can load multiple textures
const textureLoader = new THREE.TextureLoader(loadingManager);
//load: (path, load, progress, error), i.e ()=>{"error"}, like loadingManager for individuals
const colorTexture = textureLoader.load('/textures/minecraft.png'); 
//Rest are not used here but are just to show how it would be done
const alphaTexture = textureLoader.load('/textures/door/alpha.jpg'); 
const heightTexture = textureLoader.load('/textures/door/height.jpg'); 
const normalTexture = textureLoader.load('/textures/door/normal.jpg'); 
const ambientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg'); 
const metalnessTexture = textureLoader.load('/textures/door/metalness.jpg'); 
const roughnessTexture = textureLoader.load('/textures/door/roughness.jpg'); 

// //Repeating the texture on the object, below (x,y) is represented by vector2
// colorTexture.repeat.x = 2;
// colorTexture.repeat.y = 3;
// colorTexture.wrapS = THREE.RepeatWrapping;
// colorTexture.wrapT = THREE.RepeatWrapping
// //Offesting texture
// colorTexture.offset.x = 0.5;
// colorTexture.offset.y = 0.5;
// //Rotates about bottom left corner, can change this
// colorTexture.rotation = Math.PI * 0.25;
// colorTexture.center.x = 0.5;
// colorTexture.center.y = 0.5;

//Don't need mipmaps(automacic min rescaling) if we are using NearestFilter on minFilter, +performance
colorTexture.generateMipmaps = false;
//Minifaction(scaling pixels down), magnification(scaling pixels up, can give moire pattern)
//Rescaling a texture when needed, defualt to linear merging of pixels, affects "blur" or sharpness
colorTexture.minFilter = THREE.NearestFilter;
colorTexture.magFilter = THREE.NearestFilter;
//NearestFilter/sharper texture is good for performance, if no blur is fine, use it


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ map: colorTexture }) //Using our texture
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

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
camera.position.z = 1
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