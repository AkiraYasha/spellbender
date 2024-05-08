import fs from 'node:fs'

const wasm = fs.readFileSync('./spellbender-wasm/out/out.wasm')

import { EvalResult, JsHost, createEngine } from './internal/engine'
import { sandbox } from './internal/sandbox'

const start = Date.now()

const host: JsHost = {
  wasm,
  bridge(...args) {
    console.log(JSON.stringify(args))

    return {}
  },
  interrupt_handler: () => {
    return Date.now() - start > 5000
  },
}

const engine = createEngine(host)
//const result = engine.run('$bridge({ foo: "bar" })', '<script>')

let result: EvalResult

result = engine.run(
  `
(function () {
  class BridgeError extends Error {
    constructor(message, cause) {
      super(message)
      this.name = "BridgeError"
      this.cause = cause
    }
  }

  const bridge = (...args) => {
    const request = { args }
    const response = $bridge(request)

    if (response.ok) {
      return response.result
    } else {
      throw new BridgeError(response.message, response.stack)
    }
  }

  export const proxyMarker = Symbol("Comlink.proxy");
  export const createEndpoint = Symbol("Comlink.endpoint");
  export const releaseProxy = Symbol("Comlink.releaseProxy");
  export const finalizer = Symbol("Comlink.finalizer");

  function throwIfProxyReleased(isReleased) {
    if (isReleased) {
      throw new Error("Proxy has been released and is not usable")
    }
  }

  function createProxy(path = [], target = function () {}) {
    let isProxyReleased = false
    const proxy = new Proxy(target, {
      get(_target, prop) {
        throwIfProxyReleased(isProxyReleased)

        if (prop === releaseProxy) {
          return () => {
            unregisterProxy(proxy)
            isProxyReleased = true
          };
        }

        return createProxy(ep, [...path, prop])
      },

      apply(_target, _thisArg, rawArgumentList) {
        throwIfProxyReleased(isProxyReleased)

        const last = path[path.length - 1]

      }
    })

  }


  const create_api_proxy = (name, target = {}) => {
    const handler = {
      get(target, param, receiver) {
        const api_name = name + '.' + param
        const fn = (...args) => bridge(api_name, args)

        return create_api_proxy(api_name, fn)
      },
      apply() {
        throw new Error()
      }
    }

    return new Proxy(target, handler)
  }

  globalThis.$d = create_api_proxy('$d')
  globalThis.$s = create_api_proxy('$s')
  globalThis.$db = create_api_proxy('$db')

  return true;
})()
`,
  '<sandbox>',
)
if (!result.ok) {
  console.log(result.message)
  throw new Error('Failed to initialize sandbox')
}

result = engine.run(
  `
$s.scripts.user({ foo: "bar" });
$db.f({ foo: "bar" })

`,
  '<script>',
)

/*
result = engine.run(`
$test({ foo: "bar" })
`, '<script>')
*/

console.log(result)
