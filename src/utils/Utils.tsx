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

export function getDateString(timestamp: number): string {
    let date: Date = new Date()
    if(timestamp > 9999999999){
        date = new Date(timestamp);
    }else{
        date = new Date(timestamp*1000);
    }
    const now = new Date();
    if(date.toDateString() === now.toDateString()){
        return date.getHours() + ':' +  date.getMinutes();
    }
    if(new Date(date.getDate() - 1).toDateString() === now.toDateString()){
        return 'yesterday ' + date.getHours() + ':' +  date.getMinutes();
    }
    return date.getDate() + '.' + date.getMonth() + ' ' + date.getHours() + ':' +  date.getMinutes();
}
