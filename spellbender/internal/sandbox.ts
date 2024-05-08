export const sandbox = `(function () {
  class BridgeError extends Error {
    constructor(message, cause) {
      super(message)
      this.name = 'BridgeError'
      this.cause = cause
    }
  }

  const scriptorMarker = Symbol('Sandbox.scriptor')

  const unpack = (value) => {
    if (value != null && typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.map((i) => unpack(i))
      }

      if ('$scriptor' in value) {
        return {
          [scriptorMarker]: value,
          call: (...args) => bridge({ type: 'scriptor', name: value.$scriptor.name, args }),
          name: value.name,
        }
      }

      return Object.entries(value).reduce((obj, [key, value]) => ((obj[key] = unpack(value)), obj), {})
    }

    return value
  }

  const pack = (value) => {
    if (value != null && typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.map((i) => pack(i))
      }

      if (scriptorMarker in value) {
        return value[scriptorMarker]
      }

      return Object.entries(value).reduce((obj, [key, value]) => ((obj[key] = pack(value)), obj), {})
    }

    return value
  }

  const bridge = (...args) => {
    const request = pack({ args })
    const response = $bridge(request)

    if (response.ok) {
      return unpack(response.result)
    } else {
      throw new BridgeError(response.message, response.stack)
    }
  }

  const makeColor = () => {
    const color = {}
    const ctr = '\`'

    for (let i = 48; i <= 57; i++) {
      const c = String.fromCharCode(i)
      color[c] = (message) => ctr + c + message + ctr
    }

    for (let i = 65; i <= 90; i++) {
      const c = String.fromCharCode(i)
      color[c] = (message) => ctr + c + message + ctr
    }

    for (let i = 97; i <= 122; i++) {
      const c = String.fromCharCode(i)
      color[c] = (message) => ctr + c + message + ctr
    }

    return color
  }
  globalThis.$c = makeColor()

  globalThis._START = ${_START};
  globalThis._END = ${_END};
  globalThis._TIMEOUT = ${_TIMEOUT};

  globalThis.$build = (script, ctx, packed_args) => {
    const args = unpack(packed_args)

    const module = { exports: {} }

    script(module, module.exports)

    let result

    if (module.exports.__esModule) {
      result = module.exports.default(ctx, args)
    } else {
      result = module.exports(ctx, args)
    }

    return result ?? null
  }

  globalThis.$d = (value) => {
    bridge({ type: 'debug', value })
    return value
  }

  const db = (name) => (...args) => bridge({ type: 'db', name, args })
  globalThis.$db = {
    ObjectId: db('ObjectId'),
    find: db('find'),
    findOne: db('findOne'),
    count: db('count'),
    insert: db('insert'),
    update: db('update'),
    updateOne: db('updateOne'),
    upsert: db('upsert'),
    delete: db('delete'),
  }

  const script = (name) => (...args) => bridge({ type: 'script', name, args })

  globalThis.$script = (name, ...args) => bridge({ type: 'script', name, args })

  globalThis.$s = {
    accts: {
      balance_of_owner: script('accts.balance_of_owner'),
      balance: script('accts.balance'),
      transactions: script('accts.transactions'),
      xfer_gc_to_caller: script('accts.xfer_gc_to_caller'),
      xfer_gc_to: script('accts.xfer_gc_to'),
    },
    autos: {
      reset: script('autos.reset'),
    },
    bbs: {
      r: script('bbs.r'),
      read: script('bbs.read'),
    },
    binmat: {
      c: script('binmat.c'),
      connect: script('binmat.connect'),
      x: script('binmat.x'),
      xform: script('binmat.xform'),
    },
    chats: {
      channels: script('chats.channels'),
      create: script('chats.create'),
      join: script('chats.join'),
      leave: script('chats.leave'),
      send: script('chats.send'),
      tell: script('chats.tell'),
      users: script('chats.users'),
    },
    corps: {
      create: script('corps.create'),
      hire: script('corps.hire'),
      manage: script('corps.manage'),
      offers: script('corps.offers'),
      quit: script('corps.quit'),
      top: script('corps.top'),
    },
    escrow: {
      charge: script('escrow.charge'),
      stats: script('escrow.stats'),
    },
    kernel: {
      hardline: script('kernel.hardline'),
    },
    market: {
      browse: script('market.browse'),
      buy: script('market.buy'),
      sell: script('market.sell'),
      stats: script('market.stats'),
    },
    scripts: {
      fullsec: script('scripts.fullsec'),
      get_access_level: script('scripts.get_access_level'),
      get_level: script('scripts.get_level'),
      highsec: script('scripts.highsec'),
      lowsec: script('scripts.lowsec'),
      midsec: script('scripts.midsec'),
      nullsec: script('scripts.nullsec'),
      quine: script('scripts.quine'),
      sys: script('scripts.sys'),
      trust: script('scripts.trust'),
      user: script('scripts.user'),
    },
    sys: {
      access_log: script('sys.access_log'),
      breach: script('sys.breach'),
      cull: script('sys.cull'),
      expose_access_log: script('sys.expose_access_log'),
      expose_balance: script('sys.expose_balance'),
      expose_transactions: script('sys.expose_transactions'),
      expose_upgrade_log: script('sys.expose_upgrade_log'),
      expose_upgrades: script('sys.expose_upgrades'),
      loc: script('sys.loc'),
      manage: script('sys.manage'),
      specs: script('sys.specs'),
      status: script('sys.status'),
      upgrade_log: script('sys.upgrade_log'),
      upgrades_of_owner: script('sys.upgrades_of_owner'),
      upgrades: script('sys.upgrades'),
      w4rn_message: script('sys.w4rn_message'),
      write_log: script('sys.write_log'),
      xfer_gc_from: script('sys.xfer_gc_from'),
      xfer_upgrade_from: script('sys.xfer_upgrade_from'),
      xfer_upgrade_to_caller: script('sys.xfer_upgrade_to_caller'),
      xfer_upgrade_to: script('sys.xfer_upgrade_to'),
    },
    users: {
      active: script('users.active'),
      config: script('users.config'),
      inspect: script('users.inspect'),
      last_action: script('users.last_action'),
      top: script('users.top'),
    },
    trust: {
      me: script('trust.me'),
    },
  }

  return true;
})()`
