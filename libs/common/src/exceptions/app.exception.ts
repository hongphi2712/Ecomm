import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes';

export class AppException extends HttpException {
  constructor(
    message: string,
    errorCode: ErrorCode,
    statusCode = HttpStatus.BAD_REQUEST
  ) {
    super(
      {
        message,
        errorCode
      },
      statusCode
    );
  }
}
