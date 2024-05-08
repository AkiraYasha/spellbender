import fs from 'node:fs'

const wasm = fs.readFileSync('./spellbender-wasm/out/out.wasm')

const TEMPLATE_SIZE = 194
const CHUNK_SIZE = 65_000 - TEMPLATE_SIZE

let idx = 0
let c = 0

while (idx < wasm.byteLength) {
  const size = Math.min(wasm.byteLength - idx, CHUNK_SIZE / 2)
  const hex = []
  for (let i = 0; i < size; i++) {
    hex.push((wasm[idx + i] >>> 4).toString(16))
    hex.push((wasm[idx + i] & 0xf).toString(16))
  }

  const template = [
    `function(){`,
    `//  ${hex.join('')}  //`,
    `return #fs.akira.spellbender().chunk(#fs.scripts.quine(), ${c})}`
  ].join('\n')

  fs.writeFileSync(`/home/akira/.config/hackmud/akira/scripts/buffer_${c}.js`, template, 'utf-8')

  idx += size
  c++
}
