import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiSuccessResponse } from './api-response.interface';
import { successResponse } from './api-response.util';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<ApiSuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (isStandardSuccessResponse<T>(data)) {
          return data;
        }

        return successResponse(data);
      })
    );
  }
}

function isStandardSuccessResponse<T>(
  value: unknown
): value is ApiSuccessResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as { success: unknown }).success === true &&
    'message' in value &&
    'data' in value
  );
}
