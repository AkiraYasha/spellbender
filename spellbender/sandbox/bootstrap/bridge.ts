import { BridgeRequest } from '../../engine'

export class BridgeError extends Error {
  public cause?: string

  constructor(message: string, cause?: string) {
    super(message)

    this.name = 'BridgeError'
    this.cause = cause
  }
}

export const bridge = (...args: any[]) => {
  const request: BridgeRequest = { args }
  const response = $bridge(request)

  if (response.ok) {
    return response.result
  } else {
    throw new BridgeError(response.message, response.stack)
  }
}
