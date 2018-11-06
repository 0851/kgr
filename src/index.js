import debug from 'debug';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import gulp from 'gulp';
import gulpSequence from 'gulp-sequence';
import gulpCached from 'gulp-cached';
import {readConfig} from './libs/parse-config';
import {getAbsPath} from './libs/core';
import pkg from '../package.json'

const log = debug(pkg.name);
const git_source = path.resolve(__dirname, '../.__source');

class Kgr {
    constructor(args) {
        this.setArgs(args);
        log('---start---');
        this.setConfig();
    }

    setArgs(args) {
        this.args = args;
    }

    getArgs() {
        return this.args
    }

    getOutput() {
        let output = this.getArgs().output;
        output = getAbsPath(output || 'dist');
        log('output ---> ' + output);
        return output;
    }

    setConfig() {
        const config = readConfig(this.getArgs().config)
        this.config = config;
    }

    getConfig() {
        return this.config;
    }

    configForName(name) {
        const config = this.getConfig();
        const matched = _.find(config, function (conf) {
            return conf.name === name;
        });
        if (!matched) {
            throw new Error(name + ' not fount matched ' + JSON.stringify(config) + ' , please check config file');
        }
        return matched;
    }

    init() {

    }

    gulp() {

    }

    devServer() {

    }

    dev() {

    }

    build() {

    }

    async run() {
        let args = this.getArgs();
        let name = args.name || this.getConfig()[0].name;
        let mode = args.mode || 'dev';
        if (!name) {
            throw new Error('请设置一个启动项目的名称');
        }
        if (mode === 'dev') {
            await this.dev(name);
        }
        if (mode === 'build') {
            await this.build(name);
        }
    }
}
export default Kgr