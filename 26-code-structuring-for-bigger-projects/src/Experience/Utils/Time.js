// Deals with time, like three.js clockL: current/elapsed time, delta time between frames...

import EventEmitter from "./EventEmitter";

export default class Time extends EventEmitter {
    constructor(){
        super()

        // Setup
        this.start = Date.now()
        this.current = this.start
        this.elapsed = 0
        // Default screens on 16fps - delta is 16(0 causes problems sometimes for first frame)
        this.delta = 16

        window.requestAnimationFrame(() => {
            this.tick()
        })
    }

    tick(){
        const currentTime = Date.now()
        this.delta = currentTime - this.current
        this.current = currentTime
        this.elapsed = this.current - this.start

        this.trigger('tick')

        // Again, don't use this.tick() directly as the context will be lost like in Experience resize
        window.requestAnimationFrame(() => {
            this.tick()
        })
    }
}