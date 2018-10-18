

export class Contact {

    private name: string;
    private address:string;

    constructor(name:string, address:string) {
        this.name = name;
        this.address = address;
    }

    get Name() {
        return this.name;
    }

    get Address() {
        return this.address;
    }
}
