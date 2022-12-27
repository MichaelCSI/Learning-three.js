import EventEmitter from "./EventEmitter"

// Extend event emitter class to trigger events
export default class Sizes extends EventEmitter {
    constructor(){
        super()

        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)

        // Resize event
        window.addEventListener('resize', () => {
            this.width = window.innerWidth
            this.height = window.innerHeight
            this.pixelRatio = Math.min(window.devicePixelRatio, 2)

            // Trigger event(handled in Experience)
            this.trigger('resize')
        })
    }
}