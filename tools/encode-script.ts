import fs from 'node:fs'
import path from 'node:path'

const [filePath] = process.argv.slice(2)
const fileName = path.basename(filePath)

let raw = fs.readFileSync(filePath, 'utf-8')

const result = [
  `function(ctx, args) {`,
  '  return #fs.akira.spellbender().script(ctx, args, #fs.scripts.quine(), #ns.akira.abi())',
  '//$ -- begin -- ',
  ...raw.split('\n').map((line) => `//$ ${line}`),
  '//$ -- end --',
  '  }',
].join('\n')

fs.writeFileSync(`/home/akira/.config/hackmud/akira/scripts/${fileName}`, result, 'utf-8')
