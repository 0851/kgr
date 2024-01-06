#!/usr/bin/env node
'use strict';
import commander from 'commander'
import Kgr from '../index.js'
import pkg from '../../package.json'

commander
    .version(pkg.version)
    .option('-c, --config [config]', 'config file \',\' separated, glob mode', val => {
        return val.split(',');
    })
    .option('-o, --output [output]', 'output path , dev tmp path', 'output')
    .option('-d, --dest [dest]', 'dest path', 'dest')
    .option('-s, --source [source]', 'source path', '.source')
    .option('-m, --mode [mode]', 'run project mode , default dev', 'dev')
    .option('-n, --name [name]', 'run project name , default find first name in config file', '')
    .option('--init [init]', 'init project', '')
    .option('--copy [copy]', 'copy project', '')
    .option('--repull [repull]', 'repull project', '')
    .option('--retar [retar]', 'retar project', '')
    .parse(process.argv)

export default new Kgr(commander).run();

