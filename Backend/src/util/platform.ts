import axios, { AxiosInstance } from "axios";

export default class Platform {
  public static get instance(): Platform {
    if (!Platform._instance) {
      Platform._instance = new Platform();
    }
    return Platform._instance;
  }

  private static _instance: Platform;

  private axiosInstance: AxiosInstance;
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.MOSSVERSE_PLATFORM_BASE,
    });
  }

  public async fetchUserInfo(token: string) {
    const { data } = await this.axiosInstance.get('/user/whoAmI', {
      headers: {
        Authorization: token,
      }
    });
    return data;
  }
  public async fetchUserPoint(userId: string) {
    const { data } = await this.axiosInstance.get(`/point/${userId}`, {
      headers: {
        Authorization: process.env.ADMIN_TOKEN,
      }
    });
    return data;
  }

  public async updateUserPoint(userId: string, ticketId: string, pointDelta: number) {
    const { data } = await this.axiosInstance.post(`/point/${userId}`, {
      hash: ticketId,
      num: pointDelta,
    }, {
      headers: {
        Authorization: process.env.ADMIN_TOKEN,
      }
    });
    return data;
  }
}