import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import { DEFAULT_ERROR_CODE } from '../constants';
import { RequestWithContext } from '../types';
import { ApiErrorResponse } from './api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<RequestWithContext>();
    const response = context.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    const body: ApiErrorResponse = {
      success: false,
      message: getErrorMessage(exception, exceptionResponse),
      errorCode: getErrorCode(exceptionResponse),
      correlationId: request.correlationId
    };

    response.status(status).json(body);
  }
}

function getErrorMessage(
  exception: unknown,
  exceptionResponse: string | object | undefined
): string {
  if (typeof exceptionResponse === 'string') {
    return exceptionResponse;
  }

  if (
    typeof exceptionResponse === 'object' &&
    exceptionResponse !== null &&
    'message' in exceptionResponse
  ) {
    const message = (exceptionResponse as { message: unknown }).message;
    return Array.isArray(message) ? message.join(', ') : String(message);
  }

  if (exception instanceof Error) {
    return exception.message;
  }

  return 'Internal server error';
}

function getErrorCode(exceptionResponse: string | object | undefined): string {
  if (
    typeof exceptionResponse === 'object' &&
    exceptionResponse !== null &&
    'errorCode' in exceptionResponse
  ) {
    return String((exceptionResponse as { errorCode: unknown }).errorCode);
  }

  return DEFAULT_ERROR_CODE;
}
