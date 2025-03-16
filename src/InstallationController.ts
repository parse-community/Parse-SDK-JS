import CoreManager from './CoreManager';
import Storage from './Storage';
import ParseInstallation from './ParseInstallation';
import uuidv4 from './uuid';

const CURRENT_INSTALLATION_KEY = 'currentInstallation';
const CURRENT_INSTALLATION_ID_KEY = 'currentInstallationId';

let iidCache: string | null = null;
let currentInstallationCache: ParseInstallation | null = null;
let currentInstallationCacheMatchesDisk = false;

const InstallationController = {
  async updateInstallationOnDisk(installation: ParseInstallation): Promise<void> {
    const path = Storage.generatePath(CURRENT_INSTALLATION_KEY);
    await Storage.setItemAsync(path, JSON.stringify(installation.toJSON()));
    this._setCurrentInstallationCache(installation);
  },

  async currentInstallationId(): Promise<string> {
    if (typeof iidCache === 'string') {
      return iidCache;
    }
    const path = Storage.generatePath(CURRENT_INSTALLATION_ID_KEY);
    let iid = await Storage.getItemAsync(path);
    if (!iid) {
      iid = uuidv4();
      return Storage.setItemAsync(path, iid).then(() => {
        iidCache = iid;
        return iid;
      });
    }
    iidCache = iid;
    return iid;
  },

  async currentInstallation(): Promise<ParseInstallation | null> {
    if (currentInstallationCache) {
      return currentInstallationCache;
    }
    if (currentInstallationCacheMatchesDisk) {
      return null;
    }
    const path = Storage.generatePath(CURRENT_INSTALLATION_KEY);
    let installationData: any = await Storage.getItemAsync(path);
    currentInstallationCacheMatchesDisk = true;
    if (installationData) {
      installationData = JSON.parse(installationData);
      installationData.className = '_Installation';
      const current = ParseInstallation.fromJSON(installationData) as ParseInstallation;
      currentInstallationCache = current;
      return current as ParseInstallation;
    }
    const installationId = await this.currentInstallationId();
    const installation = new ParseInstallation();
    installation.set('deviceType', ParseInstallation.DEVICE_TYPES.WEB);
    installation.set('installationId', installationId);
    installation.set('parseVersion', CoreManager.get('VERSION'));
    currentInstallationCache = installation;
    await Storage.setItemAsync(path, JSON.stringify(installation.toJSON()));
    return installation;
  },

  _clearCache() {
    iidCache = null;
    currentInstallationCache = null;
    currentInstallationCacheMatchesDisk = false;
  },

  _setInstallationIdCache(iid: string) {
    iidCache = iid;
  },

  _setCurrentInstallationCache(installation: ParseInstallation, matchesDisk = true) {
    currentInstallationCache = installation;
    currentInstallationCacheMatchesDisk = matchesDisk;
  },
};

export default InstallationController;
