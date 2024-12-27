import {
  BridgeMessage,
  CountDatabaseCallBridgeMessage,
  DebugBridgeMessage,
  DeleteDatabaseCallBridgeMessage,
  ExitBridgeMessage,
  FindDatabaseCallBridgeMessage,
  FindOneDatabaseCallBridgeMessage,
  InsertDatabaseCallBridgeMessage,
  ObjectIdDatabaseCallBridgeMessage,
  ScriptCallBridgeMessage,
  ScriptorCallBridgeMessage,
  UpdateDatabaseCallBridgeMessage,
  UpdateOneDatabaseCallBridgeMessage,
  UpsertDatabaseCallBridgeMessage,
  WriteBridgeMessage,
} from './protocol'
import { Sandbox, ScriptResult, Scriptor } from './types'

export type Bridge = {
  handler(msg: BridgeMessage): unknown
}

type Handlers = {
  ['call.db.object_id']: (msg: ObjectIdDatabaseCallBridgeMessage) => unknown
  ['call.db.find']: (msg: FindDatabaseCallBridgeMessage) => unknown
  ['call.db.find_one']: (msg: FindOneDatabaseCallBridgeMessage) => unknown
  ['call.db.count']: (msg: CountDatabaseCallBridgeMessage) => unknown
  ['call.db.insert']: (msg: InsertDatabaseCallBridgeMessage) => unknown
  ['call.db.update']: (msg: UpdateDatabaseCallBridgeMessage) => unknown
  ['call.db.update_one']: (msg: UpdateOneDatabaseCallBridgeMessage) => unknown
  ['call.db.upsert']: (msg: UpsertDatabaseCallBridgeMessage) => unknown
  ['call.db.delete']: (msg: DeleteDatabaseCallBridgeMessage) => unknown
  ['call.script']: (msg: ScriptCallBridgeMessage) => unknown
  ['call.scriptor']: (msg: ScriptorCallBridgeMessage) => unknown
  ['write']: (msg: WriteBridgeMessage) => unknown
  ['debug']: (msg: DebugBridgeMessage) => unknown
  ['exit']: (msg: ExitBridgeMessage) => unknown
}

export const newBridge = (sandbox: Sandbox): Bridge => {
  const binding = (name: string): Function => {
    const fn = sandbox.bindings[name]
    if (!fn) throw new Error(`Script binding missing '${name}'`)

    return fn
  }

  const scriptor = (name: string): Scriptor => {
    const fn = sandbox.scriptors[name]
    if (!fn) throw new Error(`Scriptor missing '${name}'`)

    return fn
  }

  const find = (msg: FindDatabaseCallBridgeMessage): Cursor => {
    const fn = binding('db.f')

    const query = msg.args[0]
    const options = msg.args[1] ?? {}

    const cursor = fn(query, options.projection)

    if ('sort' in options) cursor.sort(options.sort)
    if ('skip' in options) cursor.skip(options.skip)
    if ('limit' in options) cursor.limit(options.limit)

    return cursor
  }

  const handlers: Handlers = {
    ['call.db.object_id']: (msg) => binding('db.ObjectId')(),
    ['call.db.find']: (msg) => find(msg).array(),
    ['call.db.find_one']: (msg) => find(msg).first(),
    ['call.db.count']: (msg) => find(msg).count(),
    ['call.db.insert']: (msg) => binding('db.i')(...msg.args),
    ['call.db.update']: (msg) => binding('db.u')(...msg.args),
    ['call.db.update_one']: (msg) => binding('db.u1')(...msg.args),
    ['call.db.upsert']: (msg) => binding('db.us')(...msg.args),
    ['call.db.delete']: (msg) => binding('db.r')(...msg.args),
    ['call.script']: (msg) => binding(msg.name)(...msg.args),
    ['call.scriptor']: (msg) => scriptor(msg.name).call(msg.args[0]),

    ['write']: (msg) => {
      sandbox.output.push(...msg.message.split('\n'))
    },

    ['debug']: (msg) => {
      sandbox.debug.push(...msg.message.split('\n'))
      binding('debug')(msg.message)
    },

    ['exit']: (msg) => {
      sandbox.exit(msg.result as ScriptResult)
    },
  }

  return {
    handler: (msg: BridgeMessage) => {
      if (sandbox.hasExceededDeadline()) return
      return handlers[msg.kind](msg as any)
    }
  }
}
