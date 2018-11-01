export function getRandomSeed(lenght: number = 81){                      
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9"; 
    const randomValues = new Uint32Array(length);       
    const result = new Array(length);             

    window.crypto.getRandomValues(randomValues);      

    let cursor = 0;                                   
    for (let i = 0; i < randomValues.length; i++) {   
        cursor += randomValues[i];                    
        result[i] = chars[cursor % chars.length];     
    }
    return result.join('');    
}