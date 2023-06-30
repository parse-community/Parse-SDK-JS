/**
 * @flow
 */
declare global {
    var XDomainRequest: any;
}
import { resolvingPromise } from './promiseUtils';
export type RequestOptions = {
    useMasterKey?: boolean;
    sessionToken?: string;
    installationId?: string;
    returnStatus?: boolean;
    batchSize?: number;
    include?: any;
    progress?: any;
    context?: any;
    usePost?: boolean;
};
export type FullOptions = {
    success?: any;
    error?: any;
    useMasterKey?: boolean;
    sessionToken?: string;
    installationId?: string;
    progress?: any;
    usePost?: boolean;
    context?: any;
    requestTask?: (args1: any) => void;
};
declare const RESTController: {
    ajax(method: string, url: string, data: any, headers?: any, options?: FullOptions): resolvingPromise<any> | Promise<unknown>;
    request(method: string, path: string, data: any, options?: RequestOptions): any;
    handleError(response: any): Promise<never>;
    _setXHR(xhr: any): void;
    _getXHR(): any;
};
export default RESTController;
