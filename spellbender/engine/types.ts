// Bridge messages
export type BridgeRequest = {
  args: any[]
}

export type BridgeSuccessResponse = {
  ok: true
  result: any
}

export type BridgeFailureResponse = {
  ok: false
  message: string
  stack?: string
}

export type BridgeResponse = BridgeSuccessResponse | BridgeFailureResponse

// JS Engine Types (wasm)
export type Ptr = number
export type JsRuntime = Ptr & { _type: 'JS_Runtime' } // Branded JS_Runtime pointer
export type JsContext = Ptr & { _type: 'JS_Context' } // Branded JS_Context pointer

export type WasmImports = WebAssembly.Imports & {
  wasi_snapshot_preview1: {
    clock_time_get(clockId: number, precision: unknown, outPtr: Ptr): number
    fd_write(fd: number, iovsPtr: Ptr, iovsLen: number, nwrittenPtr: Ptr): void
    fd_close(): void
    fd_fdstat_get(): void
    fd_seek(): void
  }
  env: {
    sb_bridge: (payloadPtr: Ptr) => Ptr
    sb_interrupt_handler: () => boolean
  }
}

export type WasmExports = WebAssembly.Exports & {
  memory: WebAssembly.Memory

  malloc(size: number): Ptr
  free(ptr: Ptr): void

  JS_NewContext(runtime: JsRuntime): JsContext
  JS_NewRuntime(): JsRuntime

  SB_Init(runtime: JsRuntime, ctx: JsContext): void
  SB_Eval(ctx: JsContext, script: Ptr, filename: Ptr): boolean
}

export type EvalSuccess = { ok: true; result: unknown }
export type EvalFailure = { ok: false; message: string; stack?: string; cause?: string }
export type EvalResult = EvalSuccess | EvalFailure

export type InterruptHandler = () => boolean
export type BridgeHandler = (...args: any[]) => any

export type Engine = {
  setInterruptHandler(handler: InterruptHandler): void
  setBridgeHandler(handler: BridgeHandler): void
  eval(code: string, filename?: string): EvalResult
  reset(): void
  abort(): void
}
