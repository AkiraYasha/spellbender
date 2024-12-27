export type UserScript = {
  name: string
  source: string
  compiled: string
}

const MAGIC_COMMENT = '\x2F\x2F\x24'
const MAGIC_BEGIN_MARKER = MAGIC_COMMENT + ' -- begin --'
const MAGIC_END_MARKER = MAGIC_COMMENT + ' -- end --'

export const newUserScript = (name: string, source: string): UserScript => {
  const compiled = compileUserScript(source)
  return { name, source, compiled }
}

const compileUserScript = (source: string): string => {
  const compiled: string[] = []
  const lines = source.split('\n')

  let inside: boolean = false
  for (const line of lines) {
    if (line.trim() === MAGIC_END_MARKER) inside = false
    compiled.push(inside ? line.replace(MAGIC_COMMENT, '   ') : '')
    if (line.trim() === MAGIC_BEGIN_MARKER) inside = true
  }

  return compiled.join('\n')
}
