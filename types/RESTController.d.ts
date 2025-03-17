export type RequestOptions = {
    useMasterKey?: boolean;
    useMaintenanceKey?: boolean;
    sessionToken?: string;
    installationId?: string;
    returnStatus?: boolean;
    batchSize?: number;
    include?: any;
    progress?: any;
    context?: any;
    usePost?: boolean;
    ignoreEmailVerification?: boolean;
    transaction?: boolean;
};
export type FullOptions = {
    success?: any;
    error?: any;
    useMasterKey?: boolean;
    useMaintenanceKey?: boolean;
    sessionToken?: string;
    installationId?: string;
    progress?: any;
    usePost?: boolean;
};
declare const RESTController: {
    ajax(method: string, url: string, data: any, headers?: any, options?: FullOptions): (Promise<any> & {
        resolve: (res: any) => void;
        reject: (err: any) => void;
    }) | Promise<unknown>;
    request(method: string, path: string, data: any, options?: RequestOptions): Promise<any>;
    handleError(response: any): Promise<never>;
    _setXHR(xhr: any): void;
    _getXHR(): any;
};
export default RESTController;
