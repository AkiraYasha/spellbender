export default (ctx: Context) => {
  const whitelist = ['akira']

  if (!whitelist.includes(ctx.caller)) {
    return { ok: false, msg: "Access Denied" }
  }

  return {
    // DEBUG
    'debug': (value) => $D(value),

    // DATABASE
    'db.ObjectId': () => $db.ObjectId(),
    'db.i': (...args) => $db.i(...args),
    'db.r': (...args) => $db.r(...args),
    'db.f': (...args) => $db.f(...args),
    'db.u': (...args) => $db.u(...args),
    'db.u1': (...args) => $db.u1(...args),
    'db.us': (...args) => $db.us(...args),

    // FULLSEC
    'accts.balance_of_owner': (args) => $fs.accts.balance_of_owner(args),
    'accts.xfer_gc_to_caller': (args) => $fs.accts.xfer_gc_to_caller(args),
    'bbs.r': (args) => $fs.bbs.r(args),
    'bbs.read': (args) => $fs.bbs.read(args),
    'chats.create': (args) => $fs.chats.create(args),
    'chats.send': (args) => $fs.chats.send(args),
    'chats.tell': (args) => $fs.chats.tell(args),
    'escrow.charge': (args) => $fs.escrow.charge(args),
    'market.browse': (args) => $fs.market.browse(args),
    'scripts.fullsec': (args) => $fs.scripts.fullsec(args),
    'scripts.get_access_level': (args) => $fs.scripts.get_access_level(args),
    'scripts.get_level': (args) => $fs.scripts.get_level(args),
    'scripts.highsec': (args) => $fs.scripts.highsec(args),
    'scripts.lib': (args) => $fs.scripts.lib(args),
    'scripts.lowsec': (args) => $fs.scripts.lowsec(args),
    'scripts.midsec': (args) => $fs.scripts.midsec(args),
    'scripts.nullsec': (args) => $fs.scripts.nullsec(args),
    'scripts.trust': (args) => $fs.scripts.trust(args),
    'sys.upgrades_of_owner': (args) => $fs.sys.upgrades_of_owner(args),
    'sys.w4rn_message': (args) => $fs.sys.w4rn_message(args),
    'sys.xfer_upgrade_to_caller': (args) => $fs.sys.xfer_upgrade_to_caller(args),
    'users.active': (args) => $fs.users.active(args),
    'users.last_action': (args) => $fs.users.last_action(args),
    'users.top': (args) => $fs.users.top(args),

    // HIGHSEC
    'accts.balance': (args) => $hs.accts.balance(args),
    'accts.transactions': (args) => $hs.accts.transactions(args),
    'scripts.sys': (args) => $hs.scripts.sys(args),
    'sys.specs': (args) => $hs.sys.specs(args),
    'sys.status': (args) => $hs.sys.status(args),
    'sys.upgrade_log': (args) => $hs.sys.upgrade_log(args),
    'sys.upgrades': (args) => $hs.sys.upgrades(args),
    'users.inspect': (args) => $hs.users.inspect(args),

    // MIDSEC
    'accts.xfer_gc_to': (args) => $ms.accts.xfer_gc_to(args),
    'autos.reset': (args) => $ms.autos.reset(args),
    'chats.channels': (args) => $ms.chats.channels(args),
    'chats.join': (args) => $ms.chats.join(args),
    'chats.leave': (args) => $ms.chats.leave(args),
    'chats.users': (args) => $ms.chats.users(args),
    'escrow.stats': (args) => $ms.escrow.stats(args),
    'market.buy': (args) => $ms.market.buy(args),
    'market.stats': (args) => $ms.market.stats(args),
    'scripts.user': (args) => $ms.scripts.user(args),
    'sys.manage': (args) => $ms.sys.manage(args),

    // // LOWSEC
    'kernel.hardline': (args) => $ls.kernel.hardline(args),
    'market.sell': (args) => $ls.market.sell(args),
    'sys.access_log': (args) => $ls.sys.access_log(args),
    'sys.cull': (args) => $ls.sys.cull(args),
    'sys.expose_access_log': (args) => $ls.sys.expose_access_log(args),
    'sys.expose_balance': (args) => $ls.sys.expose_balance(args),
    'sys.expose_transactions': (args) => $ls.sys.expose_transactions(args),
    'sys.expose_upgrade_log': (args) => $ls.sys.expose_upgrade_log(args),
    'sys.expose_upgrades': (args) => $ls.sys.expose_upgrades(args),
    'sys.loc': (args) => $ls.sys.loc(args),
    'sys.write_log': (args) => $ls.sys.write_log(args),
    'sys.xfer_gc_from': (args) => $ls.sys.xfer_gc_from(args),

    // // NULLSEC
    'binmat.c': (args) => $ns.binmat.c(args),
    'binmat.connect': (args) => $ns.binmat.connect(args),
    'binmat.x': (args) => $ns.binmat.x(args),
    'binmat.xform': (args) => $ns.binmat.xform(args),
    'corps.create': (args) => $ns.corps.create(args),
    'corps.hire': (args) => $ns.corps.hire(args),
    'corps.manage': (args) => $ns.corps.manage(args),
    'corps.offers': (args) => $ns.corps.offers(args),
    'corps.quit': (args) => $ns.corps.quit(args),
    'corps.top': (args) => $ns.corps.top(args),
    'sys.breach': (args) => $ns.sys.breach(args),
    'trust.me': (args) => $ns.trust.me(args),
    'users.config': (args) => $ns.users.config(args),
  }
}
