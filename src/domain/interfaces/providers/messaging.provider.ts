export interface IMessagingProvider {
  publish<T>(queueName: string, payload: T): Promise<void>;
}

export const IMessagingProvider = Symbol('IMessagingProvider');
