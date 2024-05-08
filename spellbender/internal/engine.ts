import * as unicode from './unicode'
import { sandbox } from './sandbox'
import { BridgeMessage } from './types'

export type EvalSuccess<T> = { ok: true; result: T }
export type EvalFailure = { ok: false; message: string; stack?: string; cause?: string }
export type EvalResult<T = unknown> = EvalSuccess<T> | EvalFailure

export type JsEngine = {
  script: <T = unknown>(script: string, filename: string, ctx: Context, args: unknown) => EvalResult<T>
  eval: <T = unknown>(script: string, filename: string) => EvalResult<T>
}

type JsPtr = number
type JsRuntime = JsPtr & { _type: 'JS_Runtime' }
type JsContext = JsPtr & { _type: 'JS_Context' }
type JsExports = {
  memory: WebAssembly.Memory

  malloc(size: number): JsPtr
  free(ptr: JsPtr): void

  JS_NewContext(runtime: JsRuntime): JsContext
  JS_NewRuntime(): JsRuntime

  SB_Init(runtime: JsRuntime, ctx: JsContext): void
  SB_Eval(ctx: JsContext, script: JsPtr, filename: JsPtr): boolean
}

type SB_BridgeRequest = { args: any[] }
type SB_BridgeResult = { ok: true; result: unknown } | { ok: false; message: string; stack?: string }

type EngineOptions = {
  wasm: Uint8Array
  imports?: Record<string, Function>
  deadline?: number
}

type Scriptor = { name: string, call: Function }
type ScriptorStub = { $scriptor: { name: string  } }

export const createEngine = (opts: EngineOptions): JsEngine => {
  opts = opts || {}

  let scriptors: Record<string, Scriptor> = {}
  let exports: JsExports
  let imports: Record<string, Function> = {}
  let stderr: string[]
  let runtime: JsRuntime
  let ctx: JsContext

  const init = () => {
    const module = new WebAssembly.Module(opts.wasm)
    const instance = new WebAssembly.Instance(module, {
      wasi_snapshot_preview1: make_wasi_imports(),
      env: {
        sb_bridge: handle_bridge_wrap,
        sb_interrupt_handler: handle_interrupt,
      },
    })

    exports = instance.exports as JsExports

    stderr = []
    runtime = exports.JS_NewRuntime()
    ctx = exports.JS_NewContext(runtime)

    exports.SB_Init(runtime, ctx)

    const result = run_eval(sandbox, '<sandbox>')
    if (!result.ok) {
      $D(result.message)
      $D(result.stack)
      throw new Error('Failed to load sandbox')
    }

    if (opts.imports) {
      imports = opts.imports
    }
  }

  const make_wasi_imports = () => {
    const noop = () => {}

    const imports: WebAssembly.ModuleImports = {}
    for (const name of ['fd_close', 'fd_fdstat_get', 'fd_seek']) {
      imports[name] = noop
    }

    imports['clock_time_get'] = handle_clock_time_get
    imports['fd_write'] = handle_fd_write

    return imports
  }

  const handle_clock_time_get = (clock_id: number, precision: unknown, out_ptr: JsPtr) => {
    if (clock_id != 0) {
      throw new Error('unsupported clock')
    }

    const memory = new DataView(exports.memory.buffer)

    var nsec = Math.round(Date.now() * 1e3 * 1e3)

    memory.setUint32(out_ptr, nsec >>> 0, true)
    memory.setUint32(out_ptr + 4, (nsec / Math.pow(2, 32)) >>> 0, true)

    return 0
  }

  const handle_fd_write = (fd: number, iovs_ptr: JsPtr, iovs_len: number, nnwritten_ptr: JsPtr) => {
    const memory = new DataView(exports.memory.buffer)
    let nwritten = 0

    for (let i = 0; i < iovs_len; i++) {
      const ptr = memory.getUint32(iovs_ptr + 8 * i, true)
      const length = memory.getUint32(iovs_ptr + 8 * i + 4, true)

      if (length > 0) {
        const buffer = new Uint8Array(memory.buffer, ptr, length)
        stderr.push(unicode.read_string(0, buffer))

        nwritten += length
      }
    }

    memory.setUint32(nnwritten_ptr, nwritten, true)
  }

  // return true if the JS code needs to be interrupted
  const handle_interrupt = (): boolean => {
    return !!opts.deadline && Date.now() - _ST > opts.deadline
  }

  const handle_bridge_wrap = (payload_ptr: JsPtr): JsPtr => {
    const payload_str = read_string(payload_ptr)
    const payload = JSON.parse(payload_str) as SB_BridgeRequest

    let result: SB_BridgeResult

    try {
      result = {
        ok: true,
        result: pack(handle_bridge(...unpack(payload.args)))
      }
    } catch (error) {
      if (error instanceof Error) {
        result = { ok: false, message: error.message, stack: error.stack }
      } else {
        result = { ok: false, message: String(error) }
      }
    }

    const result_str = JSON.stringify(result)
    const result_ptr = write_string(result_str)
    return result_ptr
  }

  const get_import = (name: string): Function => {
    const fn = imports[name]
    if (!fn) throw new Error(`Script import missing '${name}'`)
    return fn
  }

  const handle_bridge = (msg: BridgeMessage): unknown => {
    switch (msg.type) {
      case 'debug':
        $D(msg.value)
        return

      case 'scriptor': {
        const fn = scriptors[msg.name]
        return fn.call(...msg.args)
      }

      case 'script': {
        const fn = get_import(msg.name)
        return fn(...msg.args)
      }

      case 'db':
        switch (msg.name) {
          case 'ObjectId': {
            const fn = get_import('db.ObjectId')
            return fn()
          }
          case 'find': {
            const fn = get_import('db.f')
            const [query, options] = msg.args
            const cursor = fn(query, options.projection)
            if ('sort' in options) cursor.sort(options.sort)
            if ('skip' in options) cursor.skip(options.skip)
            if ('limit' in options) cursor.limit(options.limit)
            return cursor.array_and_close()
          }

          case 'findOne': {
            const fn = get_import('db.f')
            const [query, options] = msg.args
            const cursor = fn(query, options.projection)
            if ('sort' in options) cursor.sort(options.sort)
            if ('skip' in options) cursor.skip(options.skip)
            if ('limit' in options) cursor.limit(options.limit)
            return cursor.first_and_close()
          }

          case 'count': {
            const fn = get_import('db.f')
            const [query, options] = msg.args
            const cursor = fn(query, options.projection)
            if ('sort' in options) cursor.sort(options.sort)
            if ('skip' in options) cursor.skip(options.skip)
            if ('limit' in options) cursor.limit(options.limit)
            return cursor.count_and_close()
          }

          case 'insert': {
            const fn = get_import('db.i')
            return fn(...msg.args)
          }

          case 'update': {
            const fn = get_import('db.u')
            return fn(...msg.args)
          }

          case 'updateOne': {
            const fn = get_import('db.u1')
            return fn(...msg.args)
          }

          case 'delete': {
            const fn = get_import('db.r')
            return fn(...msg.args)
          }
        }
    }

    throw new Error('Unsupported bridge message')
  }

  const is_scriptor = (value: object): value is Scriptor => {
    return ('name' in value && 'call' in value && typeof value.name === 'string' && typeof value.call === 'function')
  }

  const is_scriptor_stub = (value: object): value is ScriptorStub => {
    return (`$scriptor` in value)
  }

  const pack = (value: unknown): unknown => {
    if (value != null && typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.map(i => pack(i))
      }

      if (is_scriptor(value)) {
        scriptors[value.name] = value
        return { $scriptor: { name: value.name } }
      }

      return Object.entries(value).reduce<Record<string, unknown>>((obj, [key, value]) => ((obj[key] = pack(value)), obj), {})
    }

    return value
  }

  const unpack = (value: unknown): unknown => {
    if (value != null && typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.map(i => unpack(i))
      }

      if (is_scriptor_stub(value)) {
        return scriptors[value.$scriptor.name]
      }

      return Object.entries(value).reduce<Record<string, unknown>>((obj, [key, value]) => ((obj[key] = pack(value)), obj), {})
    }

    return value
  }

  const read_string = (value_ptr: JsPtr): string => {
    const memory = new Uint8Array(exports.memory.buffer)
    return unicode.read_string(value_ptr, memory)
  }

  const write_string = (value: string): JsPtr => {
    const value_bytes_length = unicode.get_byte_length(value)
    const value_ptr = exports.malloc(value_bytes_length + 1)

    const memory = new Uint8Array(exports.memory.buffer)
    unicode.write_string(value, value_ptr, memory)

    return value_ptr
  }

  const parse_script = (script: string): string => {
    const parts = script.split(/\x2F\x2F\x24\s*--\s*(?:begin|end)\s*--/)
    return parts[1]
      .split('\n')
      .map((i) => i.trim().replaceAll(/^\x2F\x2F\x24/g, ''))
      .join('\n')
  }

  const run_script = <T>(script: string, filename: string, script_ctx: Context, script_args: unknown): EvalResult<T> => {
    imports['scripts.quine'] = () => script

    const parsed_script = parse_script(script)
    const ctx_str = JSON.stringify(script_ctx)
    const args_str = JSON.stringify(pack(script_args))
    const code = `$build((function(module, exports){${parsed_script}}), ${ctx_str}, ${args_str})`
    return run_eval(code, filename)
  }

  const run_eval = <T>(script: string, filename: string): EvalResult<T> => {
    stderr = []

    filename = filename || '<script>'

    const script_ptr = write_string(script)
    const filename_ptr = write_string(filename)

    const success = exports.SB_Eval(ctx, script_ptr, filename_ptr)

    exports.free(script_ptr)
    exports.free(filename_ptr)

    if (success) {
      const [json] = stderr
      return { ok: true, result: JSON.parse(json) }
    } else {
      const [message, stack, cause] = stderr
      return { ok: false, message, stack, cause }
    }
  }

  init()

  return {
    script: run_script,
    eval: run_eval,
  }
}
