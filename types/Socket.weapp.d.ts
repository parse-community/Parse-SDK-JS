export = SocketWeapp;
declare class SocketWeapp {
    constructor(serverURL: any);
    onopen: () => void;
    onmessage: () => void;
    onclose: () => void;
    onerror: () => void;
    send(data: any): void;
    close(): void;
}
