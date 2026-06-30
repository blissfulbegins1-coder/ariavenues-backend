import { IConsumer } from "./IConsumer";
import { IBrokerConnection } from "../../config/brocker/IBrokerConnection";
import { BrokerConfig } from "../../config/brocker/brokerConfig";
import { INotificationEngine } from "../../../engines/notification/INotificationEngine";
import { ISocketService } from "../../services/socket/ISocketService";

type ConsumerConstructorParams = {
  brokerConnection: IBrokerConnection;
  notificationEngine: INotificationEngine;
  socketService: ISocketService;
};

export class Consumer implements IConsumer {
  private brokerConnection: IBrokerConnection;
  private notificationEngine: INotificationEngine;
  private socketService: ISocketService;

  constructor({ brokerConnection, notificationEngine, socketService }: ConsumerConstructorParams) {
    this.brokerConnection = brokerConnection;
    this.notificationEngine = notificationEngine;
    this.socketService = socketService;
  }

  async start(): Promise<void> {
    try {
      console.log("Starting RabbitMQ consumer...");
      const channel = this.brokerConnection.getChannel();

      await channel.consume(
        BrokerConfig.queues.NOTIFICATION_QUEUE,
        async (msg: any) => {
          if (!msg) return;

          try {
            const rawBody = msg.content.toString();
            console.log("Received notification message from queue:", rawBody);

            const payload = JSON.parse(rawBody);

            // Save to DB via notificationEngine
            const saved = await this.notificationEngine.createNotification(payload);

            // Emit via WebSocket in real-time
            this.socketService.sendNotificationToUser(saved.receiverId.toString(), "new_notification", saved);

            // Acknowledge message delivery
            channel.ack(msg);
            console.log("Notification message processed, saved, and pushed via WS!");
          } catch (error) {
            console.error("Error processing consumed message:", error);
            channel.reject(msg, false); // Discard/don't requeue to prevent infinite loops
          }
        },
        { noAck: false },
      );

      console.log("RabbitMQ consumer is listening for messages.");
    } catch (error) {
      console.error("Failed to start RabbitMQ consumer, retrying in 5s...", error);
      setTimeout(() => this.start(), 5000);
    }
  }
}
