import axios from 'axios';
import dayjs from 'dayjs';
import { IConnectionConfig } from './ConnectionConfigManager';

export interface ScanModelResponse {
    k: string; // external Id
    "n:n": Array<string>; // Name - Common
    "n:z": Array<string>; // Tandem Category - Common
}

export interface IModelSchemaResponse {
    version: "v1",
    attributes: Array<IModelSchemaAttribute>
}

export interface IModelSchemaAttribute {
    id: string;
    fam: string;
    col: string;
    name: string;
    cateogry: string;
    dataType: number;
    flags?: number;
    forgeUnit?: string;
    forgeSymbol?: string;
    context?: string;
    description?: string;
    precision?: number;
    forgeSpec?: string;
    allowedValues?: {
        list?: string[];
        map?: { [key: string]: number };
    };
}

export type IStreamDataResponse = {[keys: string]: {[unixTimestamp: number]: number}};
    

export default class TandemClient {
    private static _instance: TandemClient;
    public static get instance() {
        if (!TandemClient._instance) {
            TandemClient._instance = new TandemClient();
        }
        return TandemClient._instance;
    }

    private baseUrl: string = 'https://developer.api.autodesk.com/tandem/v1';
    private tandemBaseUrl: string = 'https://tandem.autodesk.com/api/v1';
    private token: string;

    private modelSchemaCache: Map<string, Map<string, IModelSchemaAttribute>> | null = null;

    private constructor() {
        this.token = import.meta.env.VITE_TANDEM_ACCESS_TOKEN;
    }

    public async getFacility(facilityUrn: string) {
        const response = await axios.get(`${this.baseUrl}/twins/${facilityUrn}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        });
        return response.data;
    }

    public async scanModel(modelUrn: string) {
        console.log("scanmodel ", modelUrn);
        const response = await axios.post(
            `${this.baseUrl}/modeldata/${modelUrn}/scan`,
            {
                families: [
                    "n",
                    "l",
                    "x",
                    "r",
                    "z",
                    "t",
                    "p",
                    "m"
                ],
                includeHistory: false,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            }
        );
        return response.data as ScanModelResponse[];
    }

    public async getInlineTemplate(twinId: string) {
        const response = await axios.get(
            `${this.baseUrl}/twins/${twinId}/inlinetemplate`,
            {
                headers: {  
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            }
        );
        return response.data;
    }

    public async getStreamData(config: IConnectionConfig, modelUrn?: string) {
        try {
            const response = await axios.get(
                // config.ingestionUrl,
                `${this.tandemBaseUrl}/timeseries/models/${modelUrn ? modelUrn : config.HostModelID}/streams/${config.fullId}`,
                {
                    params: {
                        from: `${dayjs().subtract(30, 'minutes').unix()}000`,
                        to: `${dayjs().unix()}000`,
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    }
                }   
            );
            return response.data as IStreamDataResponse;
        } catch (e) {
            return null;
        }
    }
    public async getModelSchema(modelUrn: string, id?: string) {
        if (!this.modelSchemaCache) {
            this.modelSchemaCache = new Map();
        }
        if (this.modelSchemaCache.has(modelUrn)) {
            const modelAttr = this.modelSchemaCache.get(modelUrn);
            return {
                version: "v1",
                attributes: Array.from(modelAttr!.values()),
            };
        }
        const response = await axios.get(
            `${this.tandemBaseUrl}/modeldata/${modelUrn}/schema`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            }
        );
        this.modelSchemaCache.set(modelUrn, new Map((response.data as IModelSchemaResponse).attributes.map((attr: IModelSchemaAttribute) => [attr.id, attr])));
        if (id) {
            if (this.modelSchemaCache.get(modelUrn)) {
                if (this.modelSchemaCache.get(modelUrn)!.has(id)) {
                    return {
                        version: "v1",
                        attributes: [this.modelSchemaCache.get(modelUrn)!.get(id)] as IModelSchemaAttribute[],
                    };
                } else {
                    return {
                        version: "v1",
                        attributes: [] as IModelSchemaAttribute[],
                    };
                }
            } else {
                return {
                    version: "v1",
                    attributes: [] as IModelSchemaAttribute[],
                };
            }
        } else {
            return response.data as IModelSchemaResponse;
        }
    }
}