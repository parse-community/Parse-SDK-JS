export interface resolvingPromise<T> extends Promise<T> {
    resolve?: (value?: any) => void;
    reject?: (value?: any) => void;
}
export declare function resolvingPromise(): resolvingPromise<any>;
export declare function when(promises: any): resolvingPromise<any> | Promise<any[]>;
export declare function continueWhile(test: any, emitter: any): any;
