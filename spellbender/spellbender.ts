import { BindingRegistry } from './sandbox/types'
import { isScriptFailure } from './sandbox/utils'

import * as host from './host'
import { newSandbox } from './sandbox/sandbox'
import { newUserScript } from './sandbox/user-script'

export default (lib_ctx: Context, lib_args: unknown) => {
  if (lib_ctx.calling_script) {
    const [caller_name, caller_script] = lib_ctx.calling_script.split('.')
    const wasm = host.wasm()

    const script = (script_ctx: Context, script_args: unknown, source: string, bindings: BindingRegistry) => {
      bindings = bindings || {}

      if (isScriptFailure(bindings)) {
        return bindings
      }

      const sandbox = newSandbox(wasm, bindings)

      if (!sandbox.ok) {
        const id = $db.ObjectId()

        const ts = Date.now()

        $db.i({
          _id: { type: 'spellbender', id },
          type: 'engine_error',
          ts: Date.now(),
          error: {
            message: sandbox.error.message,
            stack: sandbox.error.stack ? sandbox.error.stack.split('\n') : undefined,
            cause: sandbox.error.cause ? sandbox.error.cause.split('\n') : undefined,
          },
        })

        return {
          ok: false,
          msg: `Spellbender encountered an internal error\n${id.$oid}`,
        }
      }

      const script = newUserScript(lib_ctx.calling_script, source)

      try {
        return sandbox.run(script, script_ctx, script_args)
      } finally {
        const ts = Date.now()
        const duration = ts - _START

        const query = {
          _id: { type: 'spellbender', id: $db.ObjectId() },
          type: 'invocation',
          ts,
          duration,
          caller: lib_ctx.caller,
          code: script.source.split('\n'),
          author: caller_name,
          script: caller_script,
          lib_ctx: JSON.stringify(lib_ctx),
          lib_args: JSON.stringify(lib_args),
          script_ctx: JSON.stringify(script_ctx),
          script_args: JSON.stringify(script_args),
          result: JSON.stringify(sandbox.result),
          output: sandbox.output,
          debug: sandbox.debug,
        }

        $db.i(query)
      }
    }

    return { script, wasm }
  } else {
    $db.i({
      _id: { type: 'spellbender', id: $db.ObjectId() },
      type: 'usage',
      ts: Date.now(),
      caller: lib_ctx.caller,
      lib_ctx,
      lib_args,
    })

    return printUsage()
  }
}

const printUsage = () => {
  return `
\`T┏┓\`\`t┏┓┏┓┓ ┓ \`\`T┳┓\`\`t┏┓┳┓┳┓┏┓┳┓\`
\`T┗┓\`\`t┃┃┣ ┃ ┃ \`\`T┣┫\`\`t┣ ┃┃┃┃┣ ┣┫\`
\`T┗┛\`\`t┣┛┗┛┗┛┗┛\`\`T┻┛\`\`t┗┛┛┗┻┛┗┛┛┗\`
\`ASpells without limits\`

\`AEmbrace the dark magic within and cast spells without mana.\`

\`ASimply surround the scroll with runes of cloaking imbued with the forbidden marking.\`
\`ANext perform the incantation of spellbending to release the spell upon the world.\`

\`TExample:\`
\`A  \`\`cfunction(ctx, args) {\`
\`c    let familiar = {\`
\`c      'debug': value => ${'\x23'}D(value),\`
\`c      'chats.\`\`csend\`\`c': (...args) => ${'\x23'}fs.chats.send(...args),\`
\`c    }\`

\`c    return ${'\x23'}fs.\`\`Cakira\`\`c.\`\`Ts\`\`tpell\`\`Tb\`\`tender\`\`c().script(ctx, args, ${'\x23'}fs.scripts.quine(), familiar)\`
\`c    \`\`t//$ -- begin --\`
\`B    \`\`t//$\`\`B $s.\`\`Fchats\`\`B.\`\`Lsend\`\`B({ channel: "0000", msg: "Dark magic is cool!" })\`
\`B    \`\`t//$\`\`B script.\`\`Bsuccess\`\`B()\`
\`B    \`\`t//$ -- end --\`
\`c  }\`

\`TCompatibility:\`
\`A  Spellbender has a slightly different api from hackmud.\`

\`A  \`\`TSpellbender\`\`A                           \`\`THackmud\`
\`A  \`\`b━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`
\`c  script.\`\`wctx\`\`c                            \`\`cfunction(\`\`wctx\`\`c, args) {\`
\`c  script.\`\`wargs\`\`c                           \`\`cfunction(ctx, \`\`wargs\`\`c) {\`

\`c  script.\`\`wSTART\`\`c                          \`\`w_START\`
\`c  script.\`\`wEND\`\`c                            \`\`w_END\`
\`c  script.\`\`wTIMEOUT\`\`c                        \`\`w_TIMEOUT\`

\`c  script.\`\`Awrite(\`\`wmessage\`\`A : \`\`sstring\`\`A)\`\`c         \`\`C- missing -\`
\`c  script.\`\`Adebug(\`\`wmessage\`\`A : \`\`sstring\`\`A)\`\`c         \`\`A${'\x23'}D(\`\`wmessage\`\`A)\`

\`c  script.\`\`Aexit(\`\`wresult\`\`c \`\`A:? \`\`sany\`\`A)\`\`c             \`\`Areturn \`\`wresult\`
\`c  script.\`\`Asuccess(\`\`wmsg\`\`c \`\`A:? \`\`sstring\`\`A)\`\`c          \`\`Areturn { ok: true,  msg: "\`\`w...\`\`V"\`\`A }\`
\`c  script.\`\`Afailure(\`\`wmsg\`\`c \`\`A:? \`\`sstring\`\`A)\`\`c          \`\`Areturn { ok: false, msg: "\`\`w...\`\`V"\`\`A }\`

\`TScripts:\`
\`A  Scripts must be prepared before they can be called upon from the dark realm.\`

\`A    \`\`Clet familiar = {\`
\`C      \`\`b// required for debug messages to work\`
\`C      'debug': value => ${'\x23'}D(value),\`

\`C      \`\`b// add any additional scripts following this pattern\`
\`C      'chats.\`\`Csend\`\`C': (...args) => ${'\x23'}fs.\`\`Fchats\`\`C.\`\`Lsend\`\`C(...args),\`
\`C    }\`

\`A  This allows scripts to be called using the following syntax:\`

\`A    \`\`C$s.\`\`Fchats\`\`C.\`\`Lsend\`\`C()\`
`
}
