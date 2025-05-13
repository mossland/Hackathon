import axios from 'axios';
import dayjs from 'dayjs';
import { IConnectionConfig } from './ConnectionConfigManager';

export interface ScanModelResponse {
    k: string; // external Id
    "n:n": Array<string>; // Name - Common
    "n:z": Array<string>; // Tandem Category - Common
}

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
            return response.data;
        } catch (e) {
            return null;
        }
    }
    public async getModelSchema(modelUrn: string) {
        const response = await axios.get(
            `${this.baseUrl}/modeldata/${modelUrn}/schema`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            }
        );
        return response.data;
    }
}