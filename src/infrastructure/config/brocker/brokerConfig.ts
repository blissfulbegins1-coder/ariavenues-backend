import { RABBITMQ_URI } from "@/config/env";

export const BrokerConfig = {
  rabbitmqUri: RABBITMQ_URI,
  
  exchanges: {
    NOTIFICATION_EXCHANGE: "notification_exchange",
  },

  queues: {
    NOTIFICATION_QUEUE: "notification_queue",
  },

  routingKeys: {
    BOOKING_NOTIFICATION: "notification.booking",
    PAYMENT_NOTIFICATION: "notification.payment",
    ADMIN_NOTIFICATION: "notification.admin",
    ALL_NOTIFICATIONS: "notification.#",
  },
};
