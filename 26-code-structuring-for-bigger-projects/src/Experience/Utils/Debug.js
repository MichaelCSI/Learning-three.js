import * as dat from 'lil-gui'
 
export default class Debug {
    constructor(){
        // Display debug if #debug is added to url
        this.active = window.location.hash === '#debug'

        if(this.active){
            this.ui = new dat.GUI({ width: 360 })
            this.ui.close()
        }
    }
}