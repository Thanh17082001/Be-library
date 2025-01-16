export const checkExpired =  (date:Date):boolean => {
    const expirationTime:number = date.getTime();
    const currentTime: number = new Date().getTime();
    console.log(currentTime,'currentTime');
    console.log(expirationTime, 'expirationTime');
    console.log(currentTime > expirationTime, 'currentTime > expirationTime');
    return currentTime > expirationTime; 
}