export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const REQUEST_ID_HEADER = 'x-request-id';
export const IDEMPOTENCY_KEY_HEADER = 'idempotency-key';

export const DEFAULT_SUCCESS_MESSAGE = 'OK';
export const DEFAULT_ERROR_CODE = 'INTERNAL_ERROR';

export const AUTH_SCHEME_BEARER = 'Bearer';

export const KAFKA_TOPICS = {
  orderEvents: 'order.events',
  inventoryEvents: 'inventory.events',
  promotionEvents: 'promotion.events',
  paymentEvents: 'payment.events',
  shippingEvents: 'shipping.events',
  notificationEvents: 'notification.events',
  auditEvents: 'audit.events',
  fraudEvents: 'fraud.events',
  userEvents: 'user.events'
} as const;

export const KAFKA_DLQ_TOPICS = {
  orderEvents: 'order.events.dlq',
  paymentEvents: 'payment.events.dlq',
  inventoryEvents: 'inventory.events.dlq'
} as const;
