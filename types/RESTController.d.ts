type RequestOptions = {
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
type FullOptions = {
    success?: any;
    error?: any;
    useMasterKey?: boolean;
    sessionToken?: string;
    installationId?: string;
    progress?: any;
    usePost?: boolean;
};
export { RequestOptions, FullOptions };
