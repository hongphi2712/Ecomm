import { EventType } from './event-types';

export interface IntegrationEvent<TPayload = Record<string, unknown>> {
  eventId: string;
  eventType: EventType;
  correlationId: string;
  occurredAt: string;
  payload: TPayload;
}
