import { APIService } from "../application/ports";

export const useAPI = (): APIService => ({
  get: async (endpoint: string) => {
    if (endpoint.includes("alert")) {
      return import('mocks/alertExtension').then((result) => new Promise((resolve) => setTimeout(() => {
        resolve(result);
      }, 50)))
    } else if (endpoint.includes("ium")) {
      return import('mocks/IUMExtension').then((result) => new Promise((resolve) => setTimeout(() => {
        resolve(result);
      }, 50)))
    }

    return {};
  },
});
