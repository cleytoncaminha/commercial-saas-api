export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function createApiResponse<T>(
  data: T,
  message?: string,
): ApiSuccessResponse<T> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (message !== undefined && message.trim().length > 0) {
    response.message = message.trim();
  }

  return response;
}

export function createApiErrorResponse(
  message: string,
  errors?: unknown,
): ApiErrorResponse {
  const response: ApiErrorResponse = {
    success: false,
    message,
  };

  if (errors !== undefined) {
    response.errors = errors;
  }

  return response;
}
