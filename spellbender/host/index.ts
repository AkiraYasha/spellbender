import { decode } from './codec'

export type FileData = string | Uint8Array

export type FileRecord = MongoDocument & {
  _id: {
    type: string
    name: string
    owner: string
  }
  type: 'script' | 'binary'
  data: string
}

export const wasmLegacy = (): Uint8Array => {
  const query = {
    '_id.type': 'file',
    '_id.owner': 'akira',
    '_id.name': 'wasm',
  }

  const file = $db.f(query).first_and_close() as FileRecord

  return decode(file.data)
}

export const wasm = (): Uint8Array => {
  const query = {
    '_id.type': 'wasm',
  }

  const file = $db.f(query).first_and_close() as FileRecord

  const out = new Uint8Array(file.data.length)
  for (let i = 0; i < file.data.length; i++) {
    out[i] = file.data.charCodeAt(i)
  }

  return out
}
