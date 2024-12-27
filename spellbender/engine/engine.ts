import * as unicode from './unicode'
import {
  BridgeHandler,
  BridgeRequest,
  BridgeResponse,
  Engine,
  EvalResult,
  InterruptHandler,
  JsContext,
  JsRuntime,
  Ptr,
  WasmExports,
  WasmImports,
} from './types'

export const newEngine = (wasm: Uint8Array): Engine => {
  let output: string[]
  let interruptHandler: InterruptHandler | undefined
  let bridgeHandler: BridgeHandler | undefined
  let exports: WasmExports
  let runtime: JsRuntime
  let ctx: JsContext

  let shouldAbort: boolean

  const handleClockTimeGet = (clockId: number, precision: unknown, outPtr: Ptr): number => {
    if (clockId != 0) throw new Error('unsupported clock')

    const memory = new DataView(exports.memory.buffer)
    const sec = Math.round(Date.now() * 1e3 * 1e3)

    memory.setUint32(outPtr, sec >>> 0, true)
    memory.setUint32(outPtr + 4, (sec / Math.pow(2, 32)) >>> 0, true)

    return 0
  }

  const handleFdWrite = (fd: number, iovsPtr: Ptr, iovsLen: number, nwrittenPtr: Ptr): void => {
    const memory = new DataView(exports.memory.buffer)

    let written = 0
    for (let i = 0; i < iovsLen; i++) {
      const ptr = memory.getUint32(iovsPtr + 8 * i, true)
      const length = memory.getUint32(iovsPtr + 8 * i + 4, true)

      if (length > 0) {
        const buffer = new Uint8Array(memory.buffer, ptr, length)
        output.push(unicode.readString(0, buffer))
        written += length
      }
    }

    memory.setUint32(nwrittenPtr, written, true)
  }

  const handleSbInterrupt = (): boolean => {
    if (shouldAbort) return true

    return interruptHandler ? interruptHandler() : false
  }

  const handleSbBridge = (requestPtr: Ptr): Ptr => {
    if (!bridgeHandler) throw new Error('Bridge message without bridge handler')

    const requestStr = readStringFromMemory(requestPtr)
    const request = JSON.parse(requestStr) as BridgeRequest

    let response: BridgeResponse
    try {
      const result = bridgeHandler(...request.args)
      response = { ok: true, result }
    } catch (error) {
      response =
        error instanceof Error
          ? { ok: false, message: error.message, stack: error.stack }
          : { ok: false, message: String(error) }
    }

    const responseStr = JSON.stringify(response)
    const responsePtr = writeStringToMemory(responseStr)

    return responsePtr
  }

  const readStringFromMemory = (valuePtr: Ptr): string => {
    const memory = new Uint8Array(exports.memory.buffer)
    return unicode.readString(valuePtr, memory)
  }

  const writeStringToMemory = (value: string): Ptr => {
    const valueBytesLength = unicode.getByteLength(value)
    const valuePtr = exports.malloc(valueBytesLength + 1)

    const memory = new Uint8Array(exports.memory.buffer)
    unicode.writeString(value, valuePtr, memory)

    return valuePtr
  }

  const evalScript = (script: string, filename?: string): EvalResult => {
    output = []
    filename = filename || '<script>'

    const scriptPtr = writeStringToMemory(script)
    const filenamePtr = writeStringToMemory(filename)

    const success = exports.SB_Eval(ctx, scriptPtr, filenamePtr)

    exports.free(scriptPtr)
    exports.free(filenamePtr)

    if (success) {
      const [result] = output
      return { ok: true, result: result !== 'undefined' ? JSON.parse(result) : undefined }
    } else {
      const [message, stack, cause] = output
      return { ok: false, message, stack, cause }
    }
  }

  const setInterruptHandler = (handler: InterruptHandler) => (interruptHandler = handler)
  const setBridgeHandler = (handler: BridgeHandler) => (bridgeHandler = handler)

  const abort = () => {
    shouldAbort = true

    const memory = new DataView(exports.memory.buffer)

    // ctx->interrupt_counter = 0
    memory.setInt32(ctx + 252, 0, true)
  }

  const reset = () => {
    shouldAbort = false
  }

  const module = new WebAssembly.Module(wasm)
  const instance = new WebAssembly.Instance(module, {
    wasi_snapshot_preview1: {
      clock_time_get: handleClockTimeGet,
      fd_write: handleFdWrite,
      fd_close: () => {},
      fd_fdstat_get: () => {},
      fd_seek: () => {},
    },
    env: {
      sb_bridge: handleSbBridge,
      sb_interrupt_handler: handleSbInterrupt,
    },
  } satisfies WasmImports)

  exports = instance.exports as WasmExports

  runtime = exports.JS_NewRuntime()
  ctx = exports.JS_NewContext(runtime)

  exports.SB_Init(runtime, ctx)

  return { eval: evalScript, abort, reset, setInterruptHandler, setBridgeHandler }
}
