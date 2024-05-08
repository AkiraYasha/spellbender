export const get_byte_length = (str: string): number => {
  let len = 0

  for (let i = 0; i < str.length; ++i) {
    const c = str.charCodeAt(i)
    c <= 0x7f ? len++ : c <= 0x7ff ? (len += 2) : c >= 0xd800 && c <= 0xdfff ? ((len += 4), ++i) : (len += 3)
  }
  return len
}

export const read_string = (ptr: number, buffer: Uint8Array): string => {
  let str = ''
  while (true) {
    let u0 = buffer[ptr++]
    if (!u0) return str
    if (!(u0 & 0x80)) {
      str += String.fromCharCode(u0)
      continue
    }
    let u1 = buffer[ptr++] & 63
    if ((u0 & 0xe0) == 0xc0) {
      str += String.fromCharCode(((u0 & 31) << 6) | u1)
      continue
    }
    let u2 = buffer[ptr++] & 63
    if ((u0 & 0xf0) == 0xe0) {
      u0 = ((u0 & 15) << 12) | (u1 << 6) | u2
    } else {
      u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (buffer[ptr++] & 63)
    }

    if (u0 < 0x10000) {
      str += String.fromCharCode(u0)
    } else {
      let ch = u0 - 0x10000
      str += String.fromCharCode(0xd800 | (ch >> 10), 0xdc00 | (ch & 0x3ff))
    }
  }
}

export const write_string = (str: string, ptr: number, buffer: Uint8Array): void => {
  var startIdx = ptr
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i)
    if (u >= 0xd800 && u <= 0xdfff) {
      var u1 = str.charCodeAt(++i)
      u = (0x10000 + ((u & 0x3ff) << 10)) | (u1 & 0x3ff)
    }
    if (u <= 0x7f) {
      buffer[ptr++] = u
    } else if (u <= 0x7ff) {
      buffer[ptr++] = 0xc0 | (u >> 6)
      buffer[ptr++] = 0x80 | (u & 63)
    } else if (u <= 0xffff) {
      buffer[ptr++] = 0xe0 | (u >> 12)
      buffer[ptr++] = 0x80 | ((u >> 6) & 63)
      buffer[ptr++] = 0x80 | (u & 63)
    } else {
      buffer[ptr++] = 0xf0 | (u >> 18)
      buffer[ptr++] = 0x80 | ((u >> 12) & 63)
      buffer[ptr++] = 0x80 | ((u >> 6) & 63)
      buffer[ptr++] = 0x80 | (u & 63)
    }
  }
  buffer[ptr] = 0
}
