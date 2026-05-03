import { randomUUID } from 'node:crypto';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { CORRELATION_ID_HEADER, REQUEST_ID_HEADER } from '../constants';
import { RequestWithContext } from '../types';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: RequestWithContext, res: Response, next: NextFunction): void {
    const incomingCorrelationId = req.header(CORRELATION_ID_HEADER);
    const incomingRequestId = req.header(REQUEST_ID_HEADER);
    const correlationId =
      incomingCorrelationId || incomingRequestId || randomUUID();

    req.correlationId = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    next();
  }
}
