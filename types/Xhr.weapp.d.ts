declare class XhrWeapp {
    UNSENT: number;
    OPENED: number;
    HEADERS_RECEIVED: number;
    LOADING: number;
    DONE: number;
    header: any;
    readyState: any;
    status: number;
    response: string | undefined;
    responseType: string;
    responseText: string;
    responseHeader: any;
    method: string;
    url: string;
    onabort: () => void;
    onprogress: () => void;
    onerror: () => void;
    onreadystatechange: () => void;
    requestTask: any;
    constructor();
    getAllResponseHeaders(): string;
    getResponseHeader(key: any): any;
    setRequestHeader(key: any, value: any): void;
    open(method: any, url: any): void;
    abort(): void;
    send(data: any): void;
}
export default XhrWeapp;
