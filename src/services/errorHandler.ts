import { toAppError } from '../types/errors'

interface ErrorResult {
  message: string
  code: string
  status: number
}

function handleError(err: unknown): ErrorResult {
  const appError = toAppError(err)
  return {
    message: appError.message,
    code: appError.code,
    status: appError.status || 500,
  }
}

export function getErrorMessage(err: unknown): string {
  return handleError(err).message
}


