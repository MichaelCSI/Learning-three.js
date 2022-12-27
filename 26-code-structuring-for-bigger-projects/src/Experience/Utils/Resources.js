import EventEmitter from "./EventEmitter"
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// Class for assets, loading...

export default class Resources extends EventEmitter  {
    constructor(sources){
        super()

        this.sources = sources

        // Asset object
        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0

        this.setLoaders()
        this.startLoading()
    }

    setLoaders(){
        this.loaders = {}
        this.loaders.gltfLoader = new GLTFLoader()
        this.loaders.textureLoader = new THREE.TextureLoader()
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
    }

    startLoading(){
        for(const source of this.sources){
            switch(source.type){
                case "gltfModel":
                    this.loaders.gltfLoader.load(
                        source.path,
                        (file) => {
                            this.sourceLoaded(source, file)
                        }
                    )
                    break;
                case "texture":
                    this.loaders.textureLoader.load(
                        source.path,
                        (file) => {
                            this.sourceLoaded(source, file)
                        }
                    )
                    break;
                case "cubeTexture":
                    this.loaders.cubeTextureLoader.load(
                        source.path,
                        (file) => {
                            this.sourceLoaded(source, file)
                        }
                    )
                    break;
            }
        }
    }
    sourceLoaded(source, file){
        // Using bracket notation(equivalent to . notation) since we want to use the source argument
        this.items[source.name] = file
        this.loaded++
        // All resources loaded
        if(this.loaded === this.toLoad) this.trigger('ready')
    }
}