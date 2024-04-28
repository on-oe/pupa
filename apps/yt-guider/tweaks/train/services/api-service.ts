import axios, { type AxiosRequestConfig, type AxiosInstance } from 'axios';
import type { SegmentType, TranslateTool } from '../types';

export class ApiService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_APP_HOST,
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
      },
    });
  }

  private axiosInstance: AxiosInstance;

  getYTTranscript(
    videoId: string,
    options: { segment: SegmentType },
    config: AxiosRequestConfig = {},
  ) {
    return this.axiosInstance.get(
      `/transcript?v=${videoId}&segment=${options.segment}`,
      config,
    );
  }

  getTranslation(
    data: { text: string; tool?: TranslateTool },
    config: AxiosRequestConfig = {},
  ) {
    return this.axiosInstance.post('/translation', data, config);
  }
}

export const apiService = new ApiService();
