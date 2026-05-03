import { randomUUID } from 'node:crypto';
import { IntegrationEvent } from './integration-event.interface';
import { EventType } from './event-types';

export function createIntegrationEvent<TPayload>(
  eventType: EventType,
  payload: TPayload,
  correlationId: string
): IntegrationEvent<TPayload> {
  return {
    eventId: randomUUID(),
    eventType,
    correlationId,
    occurredAt: new Date().toISOString(),
    payload
  };
}
