#!/usr/bin/env node
const { copy } = require('fs-extra')
const { spawn } = require('child_process')
const pkg = require('./package.json')

const filter = name =>
  !/(?:(.git\/|node_modules|package|index.js|README.md))/i.test(name)

copy(__dirname, process.cwd(), { filter })
  .then(() =>
    spawn('npm', ['init'], {
      cwd: process.cwd(),
      detached: true,
      stdio: 'inherit'
    })
      .on('close', () =>
        spawn('npm', ['install', '--save-dev'].concat(Object.keys(pkg.devDependencies))))
  )
  .catch(err => console.error(err))
