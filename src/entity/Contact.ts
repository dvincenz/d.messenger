
export class Contact {

    private name: string;
    private address:string;
    private state:boolean;

    constructor(name:string, address:string) {
        this.name = name;
        this.address = address;
        this.state = false;
    }

    get Name() {
        return this.name;
    }

    get Address() {
        return this.address;
    }

    get State() {
        return this.state;
    }

    set State(newState: boolean) {
        this.state = newState;
    }
}
