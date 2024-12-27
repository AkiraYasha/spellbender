export type QueryOptions = {
  projection?: Projection
  sort?: SortOrder
  limit?: number
  skip?: number
}

export type ObjectIdDatabaseCallBridgeMessage = {
  kind: 'call.db.object_id'
}

export type FindAllDatabaseCallBridgeMessage = {
  kind: 'call.db.find'
  args: [Query, QueryOptions?]
}

export type FindOneDatabaseCallBridgeMessage = {
  kind: 'call.db.find_one'
  args: [Query, QueryOptions?]
}

export type CountDatabaseCallBridgeMessage = {
  kind: 'call.db.count'
  args: [Query, QueryOptions?]
}

export type InsertDatabaseCallBridgeMessage = {
  kind: 'call.db.insert'
  args: [object | object[]]
}

export type UpdateDatabaseCallBridgeMessage = {
  kind: 'call.db.update'
  args: [Query, MongoCommand]
}

export type UpdateOneDatabaseCallBridgeMessage = {
  kind: 'call.db.update_one'
  args: [Query, MongoCommand]
}

export type UpsertDatabaseCallBridgeMessage = {
  kind: 'call.db.upsert'
  args: [Query, MongoCommand]
}

export type DeleteDatabaseCallBridgeMessage = {
  kind: 'call.db.delete'
  args: [Query]
}

export type ScriptCallBridgeMessage = {
  kind: 'call.script'
  name: string
  args: any[]
}

export type ScriptorCallBridgeMessage = {
  kind: 'call.scriptor'
  name: string
  args: any
}

export type ExitBridgeMessage = {
  kind: 'exit',
  result?: unknown
}

export type WriteBridgeMessage = {
  kind: 'write'
  message: string
}

export type DebugBridgeMessage = {
  kind: 'debug'
  message: string
}

export type FindDatabaseCallBridgeMessage =
  | FindAllDatabaseCallBridgeMessage
  | FindOneDatabaseCallBridgeMessage
  | CountDatabaseCallBridgeMessage

export type DatabaseCallBridgeMessage =
  | ObjectIdDatabaseCallBridgeMessage
  | FindDatabaseCallBridgeMessage
  | InsertDatabaseCallBridgeMessage
  | UpdateDatabaseCallBridgeMessage
  | UpdateOneDatabaseCallBridgeMessage
  | UpsertDatabaseCallBridgeMessage
  | DeleteDatabaseCallBridgeMessage

export type CallBridgeMessage = DatabaseCallBridgeMessage | ScriptCallBridgeMessage | ScriptorCallBridgeMessage
export type BridgeMessage = CallBridgeMessage | ExitBridgeMessage | WriteBridgeMessage | DebugBridgeMessage
