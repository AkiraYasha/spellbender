export type QueryOptions = {
  projection?: Projection
  sort?: SortOrder
  limit?: number
  skip?: number
}

export type ObjectIdDatabaseBridgeMessage = {
  type: 'db'
  name: 'ObjectId'
  args: []
}

export type FindDatabaseBridgeMessage = {
  type: 'db'
  name: 'find'
  args: [Query, QueryOptions]
}

export type FindOneDatabaseBridgeMessage = {
  type: 'db'
  name: 'findOne'
  args: [Query, QueryOptions]
}

export type CountDatabaseBridgeMessage = {
  type: 'db'
  name: 'count'
  args: [Query, QueryOptions]
}

export type InsertDatabaseBridgeMessage = {
  type: 'db'
  name: 'insert'
  args: [object | object[]]
}

export type UpdateDatabaseBridgeMessage = {
  type: 'db'
  name: 'update'
  args: [Query, MongoCommand]
}

export type UpdateOneDatabaseBridgeMessage = {
  type: 'db'
  name: 'updateOne'
  args: [Query, MongoCommand]
}

export type UpsertDatabaseBridgeMessage = {
  type: 'db'
  name: 'updateOne'
  args: [Query, MongoCommand]
}

export type DeleteDatabaseBridgeMessage = {
  type: 'db'
  name: 'delete'
  args: [Query]
}

export type DatabaseBridgeMessage =
  | ObjectIdDatabaseBridgeMessage
  | FindDatabaseBridgeMessage
  | FindOneDatabaseBridgeMessage
  | CountDatabaseBridgeMessage
  | InsertDatabaseBridgeMessage
  | UpdateDatabaseBridgeMessage
  | UpdateOneDatabaseBridgeMessage
  | UpsertDatabaseBridgeMessage
  | DeleteDatabaseBridgeMessage

export type ScriptBridgeMessage = {
  type: 'script'
  name: string
  args: any[]
}

export type DebugBridgeMessage = {
  type: 'debug'
  value: any
}

export type ScriptorBridgeMessage = {
  type: 'scriptor'
  name: string
  args: any[]
}

export type BridgeMessage = ScriptorBridgeMessage | DatabaseBridgeMessage | ScriptBridgeMessage | DebugBridgeMessage
