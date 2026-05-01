#!/usr/bin/env node
/* eslint-disable */
const { runCli } = require('../dist/integration/example/cli')

runCli(process.argv.slice(2)).then(
  (code) => process.exit(code ?? 0),
  (err) => {
    console.error(err)
    process.exit(1)
  },
)
