import axios from 'axios';

export default class TandemClient {
    private static _instance: TandemClient;
    public static get instance() {
        if (!TandemClient._instance) {
            TandemClient._instance = new TandemClient();
        }
        return TandemClient._instance;
    }

    private baseUrl: string = 'https://developer.api.autodesk.com/tandem/v1';
    private token: string;

    private constructor() {
        this.token = import.meta.env.VITE_TANDEM_API_KEY;
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
}