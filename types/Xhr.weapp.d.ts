export = XhrWeapp;
declare class XhrWeapp {
    UNSENT: number;
    OPENED: number;
    HEADERS_RECEIVED: number;
    LOADING: number;
    DONE: number;
    header: {};
    readyState: number;
    status: number;
    response: string;
    responseType: string;
    responseText: string;
    responseHeader: {};
    method: string;
    url: string;
    onabort: () => void;
    onprogress: () => void;
    onerror: () => void;
    onreadystatechange: () => void;
    requestTask: any;
    getAllResponseHeaders(): string;
    getResponseHeader(key: any): any;
    setRequestHeader(key: any, value: any): void;
    open(method: any, url: any): void;
    abort(): void;
    send(data: any): void;
}
