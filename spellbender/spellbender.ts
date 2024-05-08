import { createEngine } from './internal/engine'
import * as fs from './internal/fs'

type LibArgs = {
  cmd?: string
}

export default (lib_ctx: Context, lib_args: LibArgs) => {
  if (lib_ctx.calling_script) {
    const [caller_name, caller_script] = lib_ctx.calling_script.split('.')

    const script = (script_ctx: Context, script_args: unknown, script: string, imports?: Record<string, Function>) => {
      const wasm = fs.read<Uint8Array>('akira', 'wasm')
      if (!wasm) throw new Error('Failed to load wasm')

      try {
        const engine = createEngine({ wasm, imports })
        const result = engine.script(script, caller_script, script_ctx, script_args)
        if (result.ok) {
          return result.result
        } else {
          $D(result.message)
          if (result.stack) $D(result.stack)
          if (result.cause) $D(result.cause)
        }
      } catch (error) {
        $D('Engine Error')
        $D(error instanceof Error ? error.stack : error)
      }
    }

    const chunk = (source: string, idx: number) => {
      const hex = source.split('  ')[1]
      const result = fs.write_buffer(caller_name, idx, hex)

      return { ok: true }
    }

    return { script, chunk }
  } else {
    $D(
      `
\`T┏┓\`\`t┏┓┏┓┓ ┓ \`\`T┳┓\`\`t┏┓┳┓┳┓┏┓┳┓\`
\`T┗┓\`\`t┃┃┣ ┃ ┃ \`\`T┣┫\`\`t┣ ┃┃┃┃┣ ┣┫\`
\`T┗┛\`\`t┣┛┗┛┗┛┗┛\`\`T┻┛\`\`t┗┛┛┗┻┛┗┛┛┗\`
\`ASpells without limits\`

\`TUsage:\`

\`Bfunction(ctx, args) {\`
\`B  return ${'\x23'}fs.akira.spellbender().script(ctx, args, ${'\x23'}fs.scripts.quine())\`
\`b  //$\`\`b -- begin --\`
\`b  //$\`\`Amodule.\`\`Aexports\`\`A = (ctx, args) => {\`
\`b  //$\`\`A  $d('Dark magic is cool!')\`
\`b  //$\`\`A}\`
\`b  //$\`\`b -- end --\`
\`B    }\`

`.trim(),
    )
  }
  /*
    if (lib_ctx.caller === 'akira') {
      if (lib_args.cmd === 'clear') {
        fs.clear_buffer(lib_ctx.caller)
        return { ok: true }
      }

      if (lib_args.cmd === 'update') {
        fs.save_buffer(lib_ctx.caller, 'wasm')
        return { ok: true }
      }

      if (lib_args.cmd === 'ls') {
        return { ok: true, msg: fs.list(lib_ctx.caller) }
      }

      return { ok: false, msg: 'Unknown command' }
    }
*/
}
