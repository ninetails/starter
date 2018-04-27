#!/usr/bin/env node
const { join } = require('path')
const { spawn } = require('child_process')
const { copy, writeFile } = require('fs-extra')
const pkg = require('./package.json')

const filter = name =>
  !/(?:(.git\/|node_modules|package|index.js|README.md))/i.test(name)

const readLocalPackage = () =>
  require(join(process.cwd(), 'package.json'))

const updateScripts = localPkg => scripts =>
  Object.assign({}, localPkg, { scripts: { ...localPkg.scripts, ...scripts } })

const overridePackage = filename => data =>
  writeFile(filename, JSON.stringify(data, null, 2))

copy(__dirname, process.cwd(), { filter })
  .catch(err => console.error(err))
  .then(() =>
    spawn('npm', ['init'], {
      cwd: process.cwd(),
      detached: true,
      stdio: 'inherit'
    })
      .on('close', () =>
        spawn('npm', ['install', '--save-dev'].concat(Object.keys(pkg.devDependencies)))
          .on('close', () =>
            overridePackage('package.json')(updateScripts(readLocalPackage())({ lint: 'eslint .', precommit: 'npm run lint' })))))
