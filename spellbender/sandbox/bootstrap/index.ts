import { BridgeRequest, BridgeResponse } from '../../engine'
import { unpack } from './scriptor'
import { bridge } from './bridge'

import './db'
import './script'

declare global {
  var $bridge: (request: BridgeRequest) => BridgeResponse
  var $run: (script: Function, ctx: Context, args: unknown) => void

  var script: {
    START: number
    END: number
    TIMEOUT: number
    RUN_ID: number

    on(event: string, handler: Function): void
    off(event: string, handler: Function): void
    emit(event: string, ...args: any[]): void

    exit(result: unknown): void
    success(msg?: string): void
    failure(msg?: string): void

    write(message: string): void
    debug(message: string): void
  }
}

const globalHandlers: Map<string, Function[]> = new Map()

globalThis.script = {
  START: _START,
  END: _END,
  TIMEOUT: _TIMEOUT,
  RUN_ID: _RUN_ID,

  on(event, handler) {
    if (globalHandlers.has(event)) {
      globalHandlers.get(event)!.push(handler)
    } else {
      globalHandlers.set(event, [handler])
    }
  },

  off(event, handler) {
    if (globalHandlers.has(event)) {
      globalHandlers.set(
        event,
        globalHandlers.get(event)!.filter((h) => h !== handler),
      )
    }
  },

  emit(event, ...args) {
    if (globalHandlers.has(event)) {
      globalHandlers.get(event)!.forEach((h) => h(...args))
    }
  },

  exit(result: unknown) {
    bridge({ kind: 'exit', result })
  },

  success(msg) {
    bridge({ kind: 'exit', result: { ok: true, msg } })
  },

  failure(msg) {
    bridge({ kind: 'exit', result: { ok: false, msg } })
  },

  write(message) {
    bridge({ kind: 'write', message: String(message) })
  },

  debug(message) {
    bridge({ kind: 'debug', message: String(message) })
  },
}

globalThis.$run = (script, ctx, args) => {
  ;(globalThis.script as any).ctx = ctx
  ;(globalThis.script as any).args = unpack(args)

  script()
}
