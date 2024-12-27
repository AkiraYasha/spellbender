import fs from 'node:fs'

// @ts-ignore
globalThis._TIMEOUT = 5000

// @ts-ignore
globalThis._START = Date.now()

// @ts-ignore
globalThis._END = globalThis._START + globalThis._TIMEOUT

Error.stackTraceLimit = 100

const wasm = fs.readFileSync('./spellbender-wasm/out/out.wasm')
const code = fs.readFileSync('./dist/test.js', 'utf-8')

async function main() {
  const { newSandbox } = await import('./sandbox/sandbox')
  const { newUserScript } = await import('./sandbox/user-script')

  const sandbox = newSandbox(wasm, { 'debug': (value: any) => console.log(value) })

  if (!sandbox.ok) {
    console.log(sandbox)
    return
  }

  const script = newUserScript('<script>', '')
  script.compiled = code

  const ctx: Context = {
    caller: 'akira',
    calling_script: null,
    cols: 100,
    rows: 100,
    this_script: 'akira.test'
  }

  const result = sandbox.run(script, ctx, null)
  console.log(result)

}

main()
