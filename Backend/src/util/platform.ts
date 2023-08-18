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
    let retryCount = 0;
    let isSuccess = false;
    let result;
    while(!isSuccess) {
      try {
        const { data } = await this.axiosInstance.get(`/point/${userId}`, {
          headers: {
            Authorization: process.env.ADMIN_TOKEN,
          }
        });
        result = data;
        isSuccess = true;
      } catch (e) {
        console.error(e);
        if (retryCount > 10) {
          throw new Error(e as any);
        }
        retryCount++;
      }
    }

    return result;
  }

  public async updateUserPoint(userId: string, ticketId: string, pointDelta: number) {
    let retryCount = 0;
    let isSuccess = false;
    let result;
    while(!isSuccess) {
      try {
        const { data } = await this.axiosInstance.post(`/point/${userId}`, {
          hash: ticketId,
          num: pointDelta,
        }, {
          headers: {
            Authorization: process.env.ADMIN_TOKEN,
          }
        });
        result = data;
        isSuccess = true;
      } catch (e) {
        console.error(e);
        if (retryCount > 10) {
          throw new Error(e as any);
        }
        retryCount++;
      }
    }
    
    return result;
  }
}