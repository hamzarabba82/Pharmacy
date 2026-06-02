export class AppError extends Error {
  code: string
  status?: number

  constructor(message: string, code: string, status?: number) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
  }
}

export class ApiError extends AppError {
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message, 'API_ERROR', status)
    this.name = 'ApiError'
    this.details = details
  }
}

export class ValidationError extends AppError {
  field?: string

  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
    this.field = field
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'غير مصرح') {
    super(message, 'AUTH_ERROR', 401)
    this.name = 'AuthError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'خطأ في الاتصال') {
    super(message, 'NETWORK_ERROR', 0)
    this.name = 'NetworkError'
  }
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err
  if (err instanceof Error) {
    if (err.message.includes('401') || err.message.includes('Unauthorized')) {
      return new AuthError()
    }
    return new ApiError(err.message, 500)
  }
  return new ApiError('حدث خطأ غير متوقع', 500)
}
