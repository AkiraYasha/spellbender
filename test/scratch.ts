const str = '240509.2019 and 240509.2160'

const match = /(\d\d)(\d\d)(\d\d)\.(\d\d)(\d\d) and (\d\d)(\d\d)(\d\d)\.(\d\d)(\d\d)/.exec(str)
const n = match?.map((i) => parseInt(i)) as number[]

const start_a = new Date(2000 + n[1], n[2] - 1, n[3], n[4], n[5]) // inclusive
const start_b = new Date(2000 + n[1], n[2] - 1, n[3], n[4], n[5] + 1) // exclusive

const end_a = new Date(2000 + n[6], n[7] - 1, n[8], n[9], n[10])
const end_b = new Date(2000 + n[6], n[7] - 1, n[8], n[9], n[10] + 1)

type Transaction = {
  time: Date
  amount: number
}

const getAmount = (t: Transaction): number => {
  return 0
}



const transactions: Transaction[] = []

// buckets
const before: Transaction[] = []
const after: Transaction[] = []

let sum = 0

for (const t of transactions) {
  // Bucket before
  if (t.time >= start_a && t.time < start_b) before.push(t)

  // Bucket Afters
  if (t.time >= end_a && t.time < end_b) after.push(t)

  // Sum middle
  if (t.time >= start_b && t.time < end_a) sum += getAmount(t)
}

before.reverse()

