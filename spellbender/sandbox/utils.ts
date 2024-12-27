import { Scriptor, ScriptorProxy, ScriptorRegistry } from './types'

export const isObject = (value: unknown): value is object => value != null && typeof value === 'object'
export const isArray = (value: unknown): value is Array<unknown> => Array.isArray(value)

export const isScriptFailure = (value: unknown): value is ScriptFailure => isObject(value) && 'ok' in value && value.ok === false

export const isScriptorProxy = (value: unknown): value is ScriptorProxy => isObject(value) && '$scriptor' in value
export const isScriptor = (value: unknown): value is Scriptor =>
  isObject(value) &&
  'name' in value &&
  typeof value.name === 'string' &&
  'call' in value &&
  typeof value.call === 'function'

export const toScriptorProxy = ({ name }: Scriptor): ScriptorProxy => ({ $scriptor: { name } })

export const mapObject = <T, U>(o: {}, fn: (value: T, key: string, index: number, array: [string, T][]) => U) =>
  Object.entries<T>(o).reduce<Record<string, U>>((r, [k, v], i, a) => ((r[k] = fn(v, k, i, a)), r), {})

export const pack = (value: unknown, registry: ScriptorRegistry): unknown => {
  if (isObject(value)) {
    if (isArray(value)) {
      return value.map((i) => pack(i, registry))
    }

    if (isScriptor(value)) {
      registry[value.name] = value
      return toScriptorProxy(value)
    }

    return mapObject(value, (i) => pack(i, registry))
  }

  return value
}

export const unpack = (value: unknown, registry: ScriptorRegistry): unknown => {
  if (isObject(value)) {
    if (isArray(value)) {
      return value.map((i) => unpack(i, registry))
    }

    if (isScriptorProxy(value)) {
      return registry[value.$scriptor.name]
    }

    return mapObject(value, (i) => unpack(i, registry))
  }
}
