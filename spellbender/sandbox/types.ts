import { EvalFailure, EvalResult } from '../engine'
import { UserScript } from './user-script'

export type ScriptFailure = {
  ok: false
  msg?: string
}

export type ScriptSuccess = {
  ok: true
  msg?: string
}

export type ScriptResult = ScriptSuccess | ScriptFailure | Array<unknown> | object | string | null

export type ScriptArgs = {
  [key: string]: unknown
}

export type Scriptor = {
  name: string
  call: (args: ScriptArgs) => ScriptResult
}

export type ScriptorProxy = {
  $scriptor: {
    name: string
  }
}

export type ScriptorRegistry = {
  [key: string]: Scriptor
}

export type BindingRegistry = {
  [key: string]: Function
}

export type Sandbox = {
  ok: true

  scriptors: ScriptorRegistry
  bindings: BindingRegistry

  hasExited: boolean
  exceededDeadline: boolean

  output: string[]
  debug: string[]
  result?: ScriptResult

  hasExceededDeadline(): boolean
  run(script: UserScript, ctx: Context, args: unknown): ScriptResult
  exit(result?: ScriptResult): void
}

export type SandboxFailure = {
  ok: false
  error: EvalFailure
}
