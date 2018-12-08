import * as OpenPGP from 'openpgp';
import { contactStore } from 'src/stores/ContactStore';
import { settingStore } from 'src/stores/SettingStore';

export class EncriptionService {
    public static async createKey(myName: string, seed: string){
        const options = {
            userIds: [{ name: myName }], 
            curve: 'curve25519', 
        };
        const key = await OpenPGP.generateKey(options)
        return {
            publicKey: this.toBase64(await this.dearmor(key.publicKeyArmored)),
            privateKey: this.toBase64(await this.dearmor(key.privateKeyArmored))
        }
    }

    public static async encript(message: string, address: string){
        const reciver = contactStore.getContactByAddress(address);
        if(reciver.publicKey === undefined){
            throw new Error("no public key aviable for this contact to be able to encript message")
        }
        if(settingStore.publicKey === undefined){
            throw new Error("no personal public key aviable in store")
        }
        const armoredKey = await this.armorPublicKey(this.toUnit8Array(reciver.publicKey))
        const armoredPersonalKey = await this.armorPublicKey(this.toUnit8Array(settingStore.publicKey))
        const optionsEncript = {
            message: OpenPGP.message.fromText(message),       
            publicKeys: [(await OpenPGP.key.readArmored(armoredKey)).keys[0], (await OpenPGP.key.readArmored(armoredPersonalKey)).keys[0]],
        }
        const ciphertext = await OpenPGP.encrypt(optionsEncript)
        const encrypted = await this.dearmor(ciphertext.data)
        return this.toBase64(encrypted)     
    }

    public static async decript(encriptedMessage: string) {
        const armoredPrivateKey = await this.armorPrivateKey(this.toUnit8Array(settingStore.privateKey))
        const key = (await OpenPGP.key.readArmored(armoredPrivateKey)).keys[0];
        const optionsDescript = {
            message: await OpenPGP.message.readArmored(await this.armoreMessage(this.toUnit8Array(encriptedMessage))),
            privateKeys: [key]
        }
        const plaintext = await OpenPGP.decrypt(optionsDescript)
        return plaintext.data 
    }

    private static async dearmor (key: string) {
        const dearmorKey = await OpenPGP.armor.decode(key)
        console.log(dearmorKey)
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