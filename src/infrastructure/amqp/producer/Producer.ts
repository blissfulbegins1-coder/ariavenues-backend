import { IProducer } from "./IProducer";
import { IBrokerConnection } from "../../config/brocker/IBrokerConnection";
import { BrokerConfig } from "../../config/brocker/brokerConfig";
import { logger } from "../../../utils/logger";

type ProducerConstructorParams = {
  brokerConnection: IBrokerConnection;
};

export class Producer implements IProducer {
  private brokerConnection: IBrokerConnection;

  constructor({ brokerConnection }: ProducerConstructorParams) {
    this.brokerConnection = brokerConnection;
  }

  async publish(routingKey: string, message: any): Promise<boolean> {
    try {
      const channel = this.brokerConnection.getChannel();
      const content = Buffer.from(JSON.stringify(message));
      return channel.publish(
        BrokerConfig.exchanges.NOTIFICATION_EXCHANGE,
        routingKey,
        content,
        { persistent: true },
      );
    } catch (error) {
      logger.error("Failed to publish message to RabbitMQ:", error);
      return false;
    }
  }
}
