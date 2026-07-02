import { connect as amqpConnect } from "amqplib";
import { IBrokerConnection } from "./IBrokerConnection";
import { BrokerConfig } from "./brokerConfig";
import { logger } from "../../../utils/logger";


export class BrokerConnection implements IBrokerConnection {
  private connection: any = null;
  private channel: any = null;

  async connect(): Promise<void> {
    try {
      logger.info("Connecting to RabbitMQ...");
      this.connection = await amqpConnect(BrokerConfig.rabbitmqUri);
      this.channel = await this.connection.createChannel();

      // Declare exchange
      await this.channel.assertExchange(
        BrokerConfig.exchanges.NOTIFICATION_EXCHANGE,
        "topic",
        { durable: true },
      );

      // Declare queue
      await this.channel.assertQueue(
        BrokerConfig.queues.NOTIFICATION_QUEUE,
        { durable: true },
      );

      // Bind queue to exchange
      await this.channel.bindQueue(
        BrokerConfig.queues.NOTIFICATION_QUEUE,
        BrokerConfig.exchanges.NOTIFICATION_EXCHANGE,
        BrokerConfig.routingKeys.ALL_NOTIFICATIONS,
      );

      logger.info("RabbitMQ Connected & configured successfully!");

      this.connection.on("error", (err: any) => {
        logger.error("RabbitMQ Connection error:", err);
        this.reconnect();
      });

      this.connection.on("close", () => {
        logger.warn("RabbitMQ Connection closed, reconnecting...");
        this.reconnect();
      });
    } catch (error) {
      logger.error("Failed to connect to RabbitMQ, retrying in 5s...", error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  private reconnect(): void {
    this.connection = null;
    this.channel = null;
    setTimeout(() => this.connect(), 5000);
  }

  getChannel(): any {
    if (!this.channel) {
      throw new Error("RabbitMQ channel is not initialized. Please connect first.");
    }
    return this.channel;
  }

  async close(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch (error) {
      logger.error("Error closing RabbitMQ connection:", error);
    }
  }
}
