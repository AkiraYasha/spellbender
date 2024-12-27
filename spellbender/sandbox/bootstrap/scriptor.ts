import { ScriptorProxy } from '../types'
import { isArray, isObject, isScriptorProxy, mapObject } from '../utils'
import { bridge } from './bridge'

const scriptorMarker = Symbol('Sandbox.scriptor')

type Scriptor = {
  [scriptorMarker]: ScriptorProxy

  name: string
  call: (...args: any[]) => any
}

const isScriptor = (value: object): value is Scriptor => {
  return scriptorMarker in value
}

const toScriptor = (value: ScriptorProxy): Scriptor => {
  return {
    [scriptorMarker]: value,

    name: value.$scriptor.name,
    call: (...args) => bridge({ kind: 'call.scriptor', name: value.$scriptor.name, args }),
  }
}

export const unpack = (value: unknown): unknown => {
  if (isObject(value)) {
    if (isArray(value)) {
      return value.map(unpack)
    }

    if (isScriptorProxy(value)) {
      return toScriptor(value)
    }

    return mapObject(value, unpack)
  }

  return value
}

export const pack = (value: unknown): unknown => {
  if (isObject(value)) {
    if (isArray(value)) {
      return value.map(pack)
    }

    if (isScriptor(value)) {
      return value[scriptorMarker]
    }

    return mapObject(value, pack)
  }

  return value
}
