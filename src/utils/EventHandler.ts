export class EventHandler {
    protected events = {};
    constructor () {
        console.log('init event handler')
    }
    
    public subscribe (eventName: string, func: any) {
        console.log('subscribe for event ' + eventName)
        this.events[eventName] = this.events[eventName] || []
        this.events[eventName].push(func)
        console.log(this.events)
    }

    public unsubscribe (eventName: string, func: any) {
        if (this.events[eventName]) {
            for (let i = 0; i < this.events[eventName].length; i++) {
                if (this.events[eventName][i] === func) {
                    this.events[eventName].splice(i, 1);
                    break;
                }
            }

        }
    }

    public publish (eventName: string, data: any) {
        console.log(this.events)
        if(this.events[eventName]){
            this.events[eventName].forEach((func: any) => {
                func(data)
            } )
        }
    }
}