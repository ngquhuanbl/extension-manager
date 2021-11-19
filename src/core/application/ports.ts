// Ports defines the interfaces used by the application layer to connect to external services/frameworks
// The ports implementation will be specified in the adapter layer

export interface APIService {
  get: (...args: any[]) => Promise<any>;
}
