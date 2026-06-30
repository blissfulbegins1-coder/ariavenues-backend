export interface IProducer {
  publish(routingKey: string, message: any): Promise<boolean>;
}
