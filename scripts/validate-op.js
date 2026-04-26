const fs = require('fs')
const { DnaValidator } = require('@dna-codes/core')

const file = process.argv[2]
const doc = JSON.parse(fs.readFileSync(file, 'utf8'))
const op = doc.operational ?? doc
const result = new DnaValidator().validate(op, 'https://dna.codes/schemas/operational')
console.log(JSON.stringify(result, null, 2))
process.exit(result.valid ? 0 : 1)
