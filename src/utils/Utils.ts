export function getRandomSeed(length: number = 81) {
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
    // TODO?: rewrite this using momentJS
    let date: Date = new Date()
    if (timestamp > 9999999999) {
        date = new Date(timestamp);
    } else {
        date = new Date(timestamp * 1000);
    }
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
        return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
    }
    if (new Date(date.getDate() - 1).toDateString() === now.toDateString()) {
        return 'yesterday ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
    }
    return ('0' + date.getDate()).slice(-2) + '.' + ('0' + date.getMonth()).slice(-2) + ' '
        + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);

}

export function isSeed(seed: string){
    const expression = RegExp('[9A-Z]{81}');
    return expression.test(seed); 
}


export function isBase64(value: string){
    const expression = RegExp('^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$');
    return expression.test(value); 
}

export async function asyncForEach(array: any, callback: any) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

// todo implement more efficient array diff method.
export function arrayDiff(baseArray: string[], toSearch: string[]) {
    const diff: string[] = []
    toSearch.forEach(s => {
        if (!baseArray.find(f => f === s)) {
            diff.push(s)
        }
    });
    return diff;
}
