export interface RequestOptions {
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
}
export interface FullOptions {
    success?: any;
    error?: any;
    useMasterKey?: boolean;
    useMaintenanceKey?: boolean;
    sessionToken?: string;
    installationId?: string;
    progress?: any;
    usePost?: boolean;
}
declare const RESTController: {
    ajax(method: string, url: string, data: any, headers?: any, options?: FullOptions): Promise<any>;
    request(method: string, path: string, data: any, options?: RequestOptions): Promise<any>;
    handleError(errorJSON: any): Promise<never>;
};
export default RESTController;
