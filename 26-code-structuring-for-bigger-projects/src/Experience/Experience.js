import Sizes from "./Utils/Sizes"
import Time from "./Utils/Time"
import * as THREE from 'three'
import Camera from "./Camera"
import Renderer from "./Renderer"
import World from './World/World'
import Resources from "./Utils/Resources"
import sources from './sources'
import Debug from "./Utils/Debug"

let instance = null

export default class Experience {
    constructor(canvas){
        // Singleton pattern: only one experience
        if(instance) return instance
        instance = this

        // Default in the console
        this.experience = this

        this.canvas = canvas

        // Setup
        this.sizes = new Sizes()
        this.time = new Time
        this.scene = new THREE.Scene()
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.resources = new Resources(sources)
        this.world = new World()
        this.debug = new Debug()

        // Global access from console - testing and stuff
        window.experience = this

        // Resize event
        // Don't use on('resize', this.resize()) ~ loses context and doesn't recognize 'this'
        this.sizes.on('resize', () => {
            this.resize()
        })

        // Time tick event
        this.time.on('tick', () => {
            this.update()
        })
    }

    // Propogate through the properties and adjust whatever needs adjusting i.e camera
    resize() {
        this.camera.resize()
        this.renderer.resize()
    }
    update(){
        this.camera.update()
        this.world.update()
        this.renderer.update()
    }
    destroy(){
        this.sizes.off('resize')
        this.time.off('tick')

        this.scene.traverse((child) => {
            if(child instanceof THREE.Mesh){
                child.geometry.dispose()
                // Loop through materials, dispose of disposable properties i.e textures
                for(const key in child.material){
                    const value = child.material[key]
                    if(value && typeof value.dispose === 'function') value.dispose()
                }
            }
        })
        this.camera.controls.dispose()
        this.renderer.instance.dispose()
        if(this.debug.active) this.debug.ui.destroy()
    }
}