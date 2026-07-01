export type IProducer = {
  publish(routingKey: string, message: any): Promise<boolean>;
}
