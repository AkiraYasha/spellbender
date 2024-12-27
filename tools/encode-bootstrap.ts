
import fs from 'node:fs'

const code = fs.readFileSync('./dist/iife/bootstrap.js', 'utf-8')

let script = code.split('\n').slice(2, -2).join('\n')

script = script
  .replace('_START', '${_START}')
  .replace('_END', '${_END}')
  .replace('_TIMEOUT', '${_TIMEOUT}')
  .replace('_RUN_ID', "'${_RUN_ID}'")

script = `export const script = \`(function() {\n${script}\n})();\n\``

fs.writeFileSync('./spellbender/sandbox/bootstrap.ts', script, 'utf-8')
