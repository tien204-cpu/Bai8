// ============================================
// RabbitMQ Event Patterns (Async)
// ============================================
export const EVENT_PATTERNS = {
  // User events
  USER_REGISTERED: 'user.registered',

  // Order events
  ORDER_CREATED: 'order.created',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_STATUS_UPDATED: 'order.status_updated',

  // Payment events
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',

  // Inventory events
  INVENTORY_LOW_STOCK: 'inventory.low_stock',
} as const;

// ============================================
// RabbitMQ Queue Names
// ============================================
export const QUEUES = {
  USER_QUEUE: 'user_queue',
  PRODUCT_QUEUE: 'product_queue',
  ORDER_QUEUE: 'order_queue',
  PAYMENT_QUEUE: 'payment_queue',
  NOTIFICATION_QUEUE: 'notification_queue',
} as const;
