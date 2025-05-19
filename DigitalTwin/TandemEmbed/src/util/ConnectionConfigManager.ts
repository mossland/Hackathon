import Papa from 'papaparse';

export interface IConnectionConfig {
    Name: string;
    'Assembly Code': string;
    Classification: string;
    HostModelID: string;
    HostElementID: string;
    facility: string;
    fullId: string;
    ingestionUrl: string;
}

export default class ConnectionConfigManager {
    private static _instance: ConnectionConfigManager;

    public static get instance(): ConnectionConfigManager {
        if (!ConnectionConfigManager._instance) {
            ConnectionConfigManager._instance = new ConnectionConfigManager();
        }
        return ConnectionConfigManager._instance;
    }

    private isLoaded: boolean = false;
    private _data: IConnectionConfig[] = [];

    public get data(): IConnectionConfig[] {
        return this._data;
    }

    public async loadData(): Promise<void> {
        if (this.isLoaded) {
            return;
        }
        await new Promise((resolve, reject) => {
            Papa.parse(
                '/connections_export.csv',
                {
                    header: true,
                    download: true,
                    complete: (results) => {
                        this._data = results.data as IConnectionConfig[];
                        resolve(results.data);
                    }
                }
            );
        }); 
        this.isLoaded = true;
    }
    public fetchDataFromName(name: string): IConnectionConfig[] {
        return this._data.filter((config) => config.Name === name);
    }
}