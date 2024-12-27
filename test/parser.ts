

type UserScript = {
  name: string
  source: string
  compiled: string
}

const newUserScript = (name: string, source: string): UserScript => {
  const compiled = compileUserScript(source)
  return { name, source, compiled }
}

const MAGIC_COMMENT = '\x2F\x2F\x24'
const MAGIC_BEGIN_MARKER = MAGIC_COMMENT + ' -- begin --'
const MAGIC_END_MARKER = MAGIC_COMMENT + ' -- end --'

const compileUserScript = (source: string): string => {
  const compiled: string[] = []
  const lines = source.split('\n')

  let inside: boolean = false
  for (const line of lines) {
    if (line.includes(MAGIC_END_MARKER)) inside = false
    compiled.push(inside ? line.replace(MAGIC_COMMENT, '   ') : '')
    if (line.includes(MAGIC_BEGIN_MARKER)) inside = true
  }

  return compiled.join('\n')
}

import fs from 'node:fs'

const script = fs.readFileSync('./script.js', 'utf8')

const userScript = newUserScript('<script>', script)


userScript.source.split('\n').forEach((v, i) => console.log((i + 1).toString().padStart(4) + '|' + v))
userScript.compiled.split('\n').forEach((v, i) => console.log((i + 1).toString().padStart(4) + '|' + v))
