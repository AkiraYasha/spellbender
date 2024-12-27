import { newEngine } from '../engine'
import { BindingRegistry, Sandbox, SandboxFailure, ScriptResult } from './types'

import * as bootstrap from './bootstrap'
import { newBridge } from './bridge'
import { UserScript } from './user-script'
import { isObject, pack } from './utils'

const DEADLINE = 4800

export const newSandbox = (wasm: Uint8Array, bindings: BindingRegistry): Sandbox | SandboxFailure => {
  const sandbox: Sandbox = {
    ok: true,

    hasExited: false,
    exceededDeadline: false,

    scriptors: {},
    bindings,

    output: [],
    debug: [],

    hasExceededDeadline(): boolean {
      sandbox.exceededDeadline = Date.now() - _START > DEADLINE
      if (sandbox.exceededDeadline) engine.abort()

      return sandbox.exceededDeadline
    },

    run(script: UserScript, ctx: Context, args: unknown): ScriptResult {
      const preparedCtx = JSON.stringify(ctx)
      const preparedArgs = JSON.stringify(pack(args, sandbox.scriptors))

      const code = `$run((function () {${script.compiled}}), ${preparedCtx}, ${preparedArgs})`

      const result = engine.eval(code, script.name)

      // Was it really an error
      if (!result.ok && !sandbox.hasExited && !sandbox.exceededDeadline) {
        sandbox.output.push(result.message)
        if (result.cause) sandbox.output.push(...result.cause.split('\n'))
        if (result.stack) sandbox.output.push(...result.stack.split('\n'))

        return { ok: false, msg: sandbox.output.join('\n') }
      }

      const rt = sandbox.result
      if (rt) {
        if (isObject(rt) && 'ok' in rt && !('msg' in rt)) {
          rt.msg = sandbox.output.slice(-999).join('\n').slice(-199_999)
        }

        return rt
      }

      return sandbox.output.slice(-999).join('\n').slice(-199_999)
    },

    exit(result: ScriptResult): void {
      sandbox.result = result
      sandbox.hasExited = true

      engine.abort()
    },
  }

  const bridge = newBridge(sandbox)

  const engine = newEngine(wasm)
  engine.setBridgeHandler(bridge.handler)
  engine.setInterruptHandler(sandbox.hasExceededDeadline)

  const result = engine.eval(bootstrap.script, '<sandbox>')
  if (!result.ok) return { ok: false, error: result }

  return sandbox
}
