import ParseInstallation from './ParseInstallation';
declare const InstallationController: {
    updateInstallationOnDisk(installation: ParseInstallation): Promise<void>;
    currentInstallationId(): Promise<string>;
    currentInstallation(): Promise<ParseInstallation | null>;
    _clearCache(): void;
    _setInstallationIdCache(iid: string): void;
    _setCurrentInstallationCache(installation: ParseInstallation, matchesDisk?: boolean): void;
};
export default InstallationController;
