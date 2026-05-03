import { DEFAULT_SUCCESS_MESSAGE } from '../constants';
import { ApiSuccessResponse } from './api-response.interface';

export function successResponse<T>(
  data: T,
  message = DEFAULT_SUCCESS_MESSAGE
): ApiSuccessResponse<T> {
  return {
    success: true,
    message,
    data
  };
}
