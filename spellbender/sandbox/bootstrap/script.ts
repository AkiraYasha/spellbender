import { pack, unpack } from './scriptor'
import { bridge } from './bridge'

declare global {
  var $s: {
    call: (name: string, ...args: any[]) => unknown

    accts: {
      balance_of_owner: Function
      balance: Function
      transactions: Function
      xfer_gc_to_caller: Function
      xfer_gc_to: Function
    }
    autos: {
      reset: Function
    }
    bbs: {
      r: Function
      read: Function
    }
    binmat: {
      c: Function
      connect: Function
      x: Function
      xform: Function
    }
    chats: {
      channels: Function
      create: Function
      join: Function
      leave: Function
      send: Function
      tell: Function
      users: Function
    }
    corps: {
      create: Function
      hire: Function
      manage: Function
      offers: Function
      quit: Function
      top: Function
    }
    escrow: {
      charge: Function
      stats: Function
    }
    kernel: {
      hardline: Function
    }
    market: {
      browse: Function
      buy: Function
      sell: Function
      stats: Function
    }
    scripts: {
      fullsec: Function
      get_access_level: Function
      get_level: Function
      highsec: Function
      lowsec: Function
      midsec: Function
      nullsec: Function
      quine: Function
      sys: Function
      trust: Function
      user: Function
    }
    sys: {
      access_log: Function
      breach: Function
      cull: Function
      expose_access_log: Function
      expose_balance: Function
      expose_transactions: Function
      expose_upgrade_log: Function
      expose_upgrades: Function
      loc: Function
      manage: Function
      specs: Function
      status: Function
      upgrade_log: Function
      upgrades_of_owner: Function
      upgrades: Function
      w4rn_message: Function
      write_log: Function
      xfer_gc_from: Function
      xfer_upgrade_from: Function
      xfer_upgrade_to_caller: Function
      xfer_upgrade_to: Function
    }
    users: {
      active: Function
      config: Function
      inspect: Function
      last_action: Function
      top: Function
    }
    trust: {
      me: Function
    }
  }
}

// Hackmud Script Interface
globalThis.$s = {
  call:                     (name: string, ...args: any) => unpack(bridge({ kind: 'call.script', name, args: pack(args) })),

  accts: {
    balance_of_owner:       (args: any) => $s.call('accts.balance_of_owner', args),
    balance:                (args: any) => $s.call('accts.balance', args),
    transactions:           (args: any) => $s.call('accts.transactions', args),
    xfer_gc_to_caller:      (args: any) => $s.call('accts.xfer_gc_to_caller', args),
    xfer_gc_to:             (args: any) => $s.call('accts.xfer_gc_to', args),
  },
  autos: {
    reset:                  (args: any) => $s.call('autos.reset', args),
  },
  bbs: {
    r:                      (args: any) => $s.call('bbs.r', args),
    read:                   (args: any) => $s.call('bbs.read', args),
  },
  binmat: {
    c:                      (args: any) => $s.call('binmat.c', args),
    connect:                (args: any) => $s.call('binmat.connect', args),
    x:                      (args: any) => $s.call('binmat.x', args),
    xform:                  (args: any) => $s.call('binmat.xform', args),
  },
  chats: {
    channels:               (args: any) => $s.call('chats.channels', args),
    create:                 (args: any) => $s.call('chats.create', args),
    join:                   (args: any) => $s.call('chats.join', args),
    leave:                  (args: any) => $s.call('chats.leave', args),
    send:                   (args: any) => $s.call('chats.send', args),
    tell:                   (args: any) => $s.call('chats.tell', args),
    users:                  (args: any) => $s.call('chats.users', args),
  },
  corps: {
    create:                 (args: any) => $s.call('corps.create', args),
    hire:                   (args: any) => $s.call('corps.hire', args),
    manage:                 (args: any) => $s.call('corps.manage', args),
    offers:                 (args: any) => $s.call('corps.offers', args),
    quit:                   (args: any) => $s.call('corps.quit', args),
    top:                    (args: any) => $s.call('corps.top', args),
  },
  escrow: {
    charge:                 (args: any) => $s.call('escrow.charge', args),
    stats:                  (args: any) => $s.call('escrow.stats', args),
  },
  kernel: {
    hardline:               (args: any) => $s.call('kernel.hardline', args),
  },
  market: {
    browse:                 (args: any) => $s.call('market.browse', args),
    buy:                    (args: any) => $s.call('market.buy', args),
    sell:                   (args: any) => $s.call('market.sell', args),
    stats:                  (args: any) => $s.call('market.stats', args),
  },
  scripts: {
    fullsec:                (args: any) => $s.call('scripts.fullsec', args),
    get_access_level:       (args: any) => $s.call('scripts.get_access_level', args),
    get_level:              (args: any) => $s.call('scripts.get_level', args),
    highsec:                (args: any) => $s.call('scripts.highsec', args),
    lowsec:                 (args: any) => $s.call('scripts.lowsec', args),
    midsec:                 (args: any) => $s.call('scripts.midsec', args),
    nullsec:                (args: any) => $s.call('scripts.nullsec', args),
    quine:                  (args: any) => $s.call('scripts.quine', args),
    sys:                    (args: any) => $s.call('scripts.sys', args),
    trust:                  (args: any) => $s.call('scripts.trust', args),
    user:                   (args: any) => $s.call('scripts.user', args),
  },
  sys: {
    access_log:             (args: any) => $s.call('sys.access_log', args),
    breach:                 (args: any) => $s.call('sys.breach', args),
    cull:                   (args: any) => $s.call('sys.cull', args),
    expose_access_log:      (args: any) => $s.call('sys.expose_access_log', args),
    expose_balance:         (args: any) => $s.call('sys.expose_balance', args),
    expose_transactions:    (args: any) => $s.call('sys.expose_transactions', args),
    expose_upgrade_log:     (args: any) => $s.call('sys.expose_upgrade_log', args),
    expose_upgrades:        (args: any) => $s.call('sys.expose_upgrades', args),
    loc:                    (args: any) => $s.call('sys.loc', args),
    manage:                 (args: any) => $s.call('sys.manage', args),
    specs:                  (args: any) => $s.call('sys.specs', args),
    status:                 (args: any) => $s.call('sys.status', args),
    upgrade_log:            (args: any) => $s.call('sys.upgrade_log', args),
    upgrades_of_owner:      (args: any) => $s.call('sys.upgrades_of_owner', args),
    upgrades:               (args: any) => $s.call('sys.upgrades', args),
    w4rn_message:           (args: any) => $s.call('sys.w4rn_message', args),
    write_log:              (args: any) => $s.call('sys.write_log', args),
    xfer_gc_from:           (args: any) => $s.call('sys.xfer_gc_from', args),
    xfer_upgrade_from:      (args: any) => $s.call('sys.xfer_upgrade_from', args),
    xfer_upgrade_to_caller: (args: any) => $s.call('sys.xfer_upgrade_to_caller', args),
    xfer_upgrade_to:        (args: any) => $s.call('sys.xfer_upgrade_to', args),
  },
  users: {
    active:                 (args: any) => $s.call('users.active', args),
    config:                 (args: any) => $s.call('users.config', args),
    inspect:                (args: any) => $s.call('users.inspect', args),
    last_action:            (args: any) => $s.call('users.last_action', args),
    top:                    (args: any) => $s.call('users.top', args),
  },
  trust: {
    me:                     (args: any) => $s.call('trust.me', args),
  },
}
