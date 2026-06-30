export const BrokerConfig = {
  rabbitmqUri: process.env.RABBITMQ_URI || "amqp://localhost",
  
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
