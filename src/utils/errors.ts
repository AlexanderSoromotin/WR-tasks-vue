import type { ApiValidationError } from '@/types'
import { AxiosError } from 'axios'

export function extractApiErrors(err: unknown): ApiValidationError {
  if (err instanceof AxiosError && err.response?.data) {
    return err.response.data as ApiValidationError
  }

  return { message: 'Произошла непредвиденная ошибка.' }
}

