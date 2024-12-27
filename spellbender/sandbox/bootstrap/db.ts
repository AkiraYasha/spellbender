import { bridge } from './bridge'

declare global {
  var $db: {
    ObjectId: Function
    find: Function
    findOne: Function
    count: Function
    insert: Function
    update: Function
    updateOne: Function
    upsert: Function
    delete: Function
  }
}


globalThis.$db = {
  ObjectId:                 () => bridge({ kind: 'call.db.object_id' }),

  find:                     (...args: any[]) => bridge({ kind: 'call.db.find', args }),
  findOne:                  (...args: any[]) => bridge({ kind: 'call.db.find_one', args }),
  count:                    (...args: any[]) => bridge({ kind: 'call.db.count', args }),
  insert:                   (...args: any[]) => bridge({ kind: 'call.db.insert', args }),
  update:                   (...args: any[]) => bridge({ kind: 'call.db.update', args }),
  updateOne:                (...args: any[]) => bridge({ kind: 'call.db.update_one', args }),
  upsert:                   (...args: any[]) => bridge({ kind: 'call.db.upsert', args }),
  delete:                   (...args: any[]) => bridge({ kind: 'call.db.delete', args }),
}
