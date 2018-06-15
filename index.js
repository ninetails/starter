#!/usr/bin/env node
const { promisify } = require('util')
const { join } = require('path')
const { spawn } = require('child_process')
const { copyFile, writeFile } = require('fs')
const readdir = require('recursive-readdir')
const pkg = require('./package.json')

const copyAsync = promisify(copyFile)

const blacklist = ['.git', 'node_modules', 'index.js', 'package*', 'README.md']
const from = __dirname
const dest = `${process.cwd()}`

const readLocalPackage = () =>
  require(join(process.cwd(), 'package.json'))

const updateScripts = localPkg => scripts =>
  Object.assign({}, localPkg, { scripts: { ...localPkg.scripts, ...scripts } })

const overridePackage = filename => data =>
  writeFile(filename, JSON.stringify(data, null, 2))

const runNpmInit = () =>
  spawn('npm', ['init', '-y'], {
    cwd: process.cwd(),
    detached: true,
    stdio: 'inherit'
  })

const runInstallDevDependencies = () =>
  spawn('npm', ['install', '--save-dev'].concat(Object.keys(pkg.devDependencies)))

const addScriptsToPackage = () =>
  overridePackage('package.json')(updateScripts(readLocalPackage())({ lint: 'eslint .', precommit: 'npm run lint' }))

readdir(from, blacklist)
  .then(paths => Promise.all(paths.map(path => copyAsync(path, `${dest}${path.split(__dirname).pop()}`))))
  .catch(err => console.error(err))
  .then(() => runNpmInit()
    .on('close', () => runInstallDevDependencies()
      .on('close', addScriptsToPackage)))
