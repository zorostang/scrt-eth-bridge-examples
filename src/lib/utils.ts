
export const sleep = (ms : number) => new Promise((accept) => setTimeout(accept, ms));


export const tryWait = async (conditionCallback : Function, 
                errorText : string,
                timeout : number = 1200) => {

    let counter = 0;

    while (conditionCallback()) {
        counter += 10;
        if (counter > timeout) {
            throw Error(errorText);
        }
        await sleep(10);
    }
    
}



export const postOptions = {
    method: "POST",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
    },
}