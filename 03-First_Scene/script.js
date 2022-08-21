//Scene
const scene = new THREE.Scene()

//Red cube
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 'red'})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

//Declaring size of the scene - used in aspect ratio for camera
const sizes = {
    width: 800,
    height: 600
}

//Need a camera, move backwards to be able to see the scene, also around to see it is a cube not a square
const camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height)
camera.position.z = 3
camera.position.x = 1
camera.position.y = 1
scene.add(camera)

//Getting canvas from html
const canvas = document.querySelector('.webgl')

//Renderer - renders the scene from the camera point of view - drawn into canvas(html element)
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

//Render the scene
renderer.render(scene, camera)