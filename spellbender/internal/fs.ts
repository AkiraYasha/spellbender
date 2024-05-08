import { decode, encode } from './codec'

export type FileData = string | Uint8Array

export type FileStat = {
  name: string
  owner: string
  type: 'script' | 'binary'
}

export type FileRecord = MongoDocument & {
  _id: {
    type: string
    name: string
    owner: string
  }
  type: 'script' | 'binary'
  data: string
}

export const write_buffer = (owner: string, idx: number, data: string) => {
  const bytes = []

  for (let c = 0; c < data.length; c += 2) {
    bytes.push(parseInt(data.substr(c, 2), 16))
  }

  return $db.us({ _id: { type: 'buffer', idx, owner } }, { data: bytes, size: bytes.length })
}

export const save_buffer = (owner: string, name: string) => {
  const query = {
    '_id.type': 'buffer',
    '_id.owner': owner,
  }

  const buffer = $db
    .f(query)
    .sort({ '_id.idx': 1 })
    .array()
    .flatMap((a) => a.data) as number[]

  return write(owner, name, new Uint8Array(buffer))
}

export const clear_buffer = (owner: string) => {
  const query = {
    '_id.type': 'buffer',
    '_id.owner': owner,
  }

  return $db.r(query).n
}

export const stat = (owner: string, name: string): FileStat | null => {
  const query = {
    '_id.type': 'file',
    '_id.owner': owner,
    '_id.name': name,
  }

  const file = $db.f(query).first_and_close() as FileRecord
  return file
    ? {
        name: file._id.name,
        owner: file._id.owner,
        type: file.type,
      }
    : null
}

export const read = <T extends FileData = FileData>(owner: string, name: string): T | null => {
  const query = {
    '_id.type': 'file',
    '_id.owner': owner,
    '_id.name': name,
  }

  const file = $db.f(query).first_and_close() as FileRecord

  if (!file) return null

  return (file ? (file.type === 'binary' ? decode(file.data) : file.data) : null) as T
}

export const write = (owner: string, name: string, input: string | Uint8Array): number => {
  let type: string
  let data: string

  if (input instanceof Uint8Array) {
    type = 'binary'
    data = encode(input)
  } else if (typeof input === 'string') {
    type = 'string'
    data = input
  } else {
    throw new Error(`Unsupported input type ${typeof input}`)
  }

  return $db.us(
    {
      _id: {
        type: 'file',
        owner,
        name,
      },
    },
    { type, data },
  ).n
}

export const remove = (owner: string, name: string): number => {
  const query = {
    '_id.type': 'file',
    '_id.owner': owner,
    '_id.name': name,
  }

  return $db.r(query).n
}

export const list = (owner: string): FileStat[] => {
  const query = {
    '_id.type': { $in: ['file', 'buffer'] },
    '_id.owner': owner,
  }

  const files = $db.f(query, { data: 0 }).array_and_close() as FileRecord[]

  return files.map((file) => {
    if (file._id.type === 'buffer') {
      return { owner: file._id.owner, name: file._id.name, type: 'buffer', idx: file._id.idx }
    } else {
      return { owner: file._id.owner, name: file._id.name, type: file.type }
    }
  })
}
