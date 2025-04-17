export declare function resolvingPromise<T = any>(): Promise<T> & {
    resolve: (res: T) => void;
    reject: (err: any) => void;
};
export declare function when(promises: any): Promise<any[]> | (Promise<any> & {
    resolve: (res: any) => void;
    reject: (err: any) => void;
});
export declare function continueWhile(test: () => any, emitter: () => Promise<any>): any;
