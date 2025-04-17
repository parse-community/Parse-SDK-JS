declare class SocketWeapp {
    onopen: () => void;
    onmessage: () => void;
    onclose: () => void;
    onerror: () => void;
    constructor(serverURL: any);
    send(data: any): void;
    close(): void;
}
export default SocketWeapp;
