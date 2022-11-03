const Net = {
    get: (url: string) => go("GET", url),
    getThenDispatch: (url: string, dispatch: any, actionType: any) => {
        return go("GET", url).then(data => {
            dispatch({
                type: actionType,
                data
            })
        })
    },
    put: (url: string, data: any) => go("PUT", url, data),
    post: (url: string, data: any) => go("POST", url, data),
    postThenDispatch: (url: string, postData: any, dispatch: any, actionType: any) => {
        return go("POST", url, postData).then(data => {
            dispatch({
                type: actionType,
                data
            })
        })
    },
    delete: (url: string, data: any) => go("DELETE", url, data),
    // use getCORS when you're not allowed to set 'content-type'
    getCORS: (url: string) => fetch(url).then(response => response.json())
};

function go(method: string, url: string, data?: any): Promise<any> {
    let options: RequestInit = {
        method,
        headers: {
            'content-type': 'application/json'
        }
    };
    if (data) {
        options.body = JSON.stringify(data);
    }

    return fetch(url, options).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not OK');
        }
        return response.json();
    });
}


export default Net;
