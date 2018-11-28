import * as OpenPGP from 'openpgp';
import { Contact } from 'src/entities';
export class EncriptionService {
    public static async createKey(myName: string, seed: string){
        const options = {
            userIds: [{ name: myName }], 
            curve: 'curve25519', 
            passphrase: seed    
        };
        const key = await OpenPGP.generateKey(options)
        return {
            publicKey: this.toBase64(await this.dearmor(key.publicKeyArmored)),
            privateKey: this.toBase64(await this.dearmor(key.privateKeyArmored))
        }
    }

    public static async encript(message: string, reciver: Contact){
        if(reciver.publicKey === undefined){
            throw new Error("no public key aviable for this contact to be able to encript message")
        }
        const byteKey = this.toUnit8Array(reciver.publicKey)
        const armoredKey = await this.armorPublicKey(byteKey)
        const optionsEncript = {
            message: OpenPGP.message.fromText(message),       
            publicKeys: (await OpenPGP.key.readArmored(armoredKey)).keys,
        }
        const ciphertext = await OpenPGP.encrypt(optionsEncript)
        const encrypted = await this.dearmor(ciphertext.data)
        return this.toBase64(encrypted)     
    }

    public static async decript(encriptedMessage: string, privateKey: string, seed: string) {
        const armoredPrivateKey = await this.armorPrivateKey(this.toUnit8Array(privateKey))
        const key = (await OpenPGP.key.readArmored(armoredPrivateKey)).keys[0];
        key.decrypt(seed);

        const optionsDescript = {
            message: await OpenPGP.message.readArmored(await this.armoreMessage(this.toUnit8Array(encriptedMessage))),
            privateKeys: [key]
        }
        OpenPGP.decrypt(optionsDescript).then((plaintext: any) => {
            console.log(plaintext.data)
            return plaintext.data 
        })
    }

    private static async dearmor (key: string) {
        const dearmorKey = await OpenPGP.armor.decode(key)
        const deedObject = await dearmorKey.data.getReader().read()
        return deedObject.value
    }

    private static async armorPrivateKey (bytes: object){
       return OpenPGP.armor.encode(OpenPGP.enums.armor.private_key, bytes, 0, 0)
    }

    private static async armorPublicKey (bytes: object){
        return OpenPGP.armor.encode(OpenPGP.enums.armor.public_key, bytes, 0, 0)
    }

    private static async armoreMessage (bytes: object){
        return OpenPGP.armor.encode(OpenPGP.enums.armor.message, bytes, 0, 0)
    }

    private static ua2text (ua: any) {
        let s = '';
        for (const m of ua) {
            s += String.fromCharCode(m);
        }
        return s;
    }
    private static toBase64(arrayBuffer: number[]){
        return btoa(String.fromCharCode(...arrayBuffer));
    }
    private static toUnit8Array(base64: string) {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return new Uint8Array(bytes.buffer);
    }
}   