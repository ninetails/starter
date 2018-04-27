#!/usr/bin/env node
const { copy } = require('fs-extra')

const filter = name =>
  !/(?:(.git|node_modules|package|index.js|README.md))/i.test(name)

copy(__dirname, process.cwd(), { filter })
  .then(() => console.log('success!'))
  .catch(err => console.error(err))
