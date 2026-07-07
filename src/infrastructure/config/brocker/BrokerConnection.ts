import { connect as amqpConnect } from "amqplib";
import { IBrokerConnection } from "./IBrokerConnection";
import { BrokerConfig } from "./brokerConfig";
import { logger } from "../../../utils/logger";


export class BrokerConnection implements IBrokerConnection {
  private connection: any = null;
  private channel: any = null;

  async connect(): Promise<void> {
    logger.info("Connecting to RabbitMQ...");
    const startTime = Date.now();
    const timer = setInterval(() => {
      const seconds = Math.round((Date.now() - startTime) / 1000);
      logger.info(`Connecting to RabbitMQ... (${seconds}s elapsed)`);
    }, 1000);

    try {
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

      clearInterval(timer);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.info(`✓ RabbitMQ Connected & configured successfully! (took ${elapsed}s)`);

      this.connection.on("error", (err: any) => {
        logger.error("RabbitMQ Connection error:", err);
        this.reconnect();
      });

      this.connection.on("close", () => {
        logger.warn("RabbitMQ Connection closed, reconnecting...");
        this.reconnect();
      });
    } catch (error) {
      clearInterval(timer);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.error(`Failed to connect to RabbitMQ after ${elapsed}s, retrying in 5s...`, error);
      await new Promise<void>((resolve) => setTimeout(resolve, 5000));
      return this.connect();
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
